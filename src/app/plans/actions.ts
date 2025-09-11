"use server";

import { z } from "zod";
import {
  generateLongTermMealPlan,
  GenerateLongTermMealPlanInput,
} from "@/ai/flows/generate-long-term-plan";
import { addMealPlan } from "@/services/meal-plan-service";
import type { MealPlan, RecipeDetails, DailyPlan } from "@/lib/types";
import { generateRecipeDetails } from "@/ai/flows/generate-recipe";
import { addRecipe } from "@/services/recipe-service";

const planFormSchema = z.object({
  numberOfDays: z.coerce
    .number()
    .min(1, "Must be at least 1 day.")
    .max(30, "Cannot generate for more than 30 days."),
  dietaryPreferences: z.string(),
  calorieTarget: z.coerce.number().min(100),
  allergies: z.string(),
  cuisine: z.string(),
  generationSource: z.enum(["catalog", "new", "combined"]),
  ingredients: z.string().optional(),
});

type FormState = {
  message: string;
  errors: Record<string, string[]> | null;
  isSuccess: boolean;
  mealPlan: string | null;
};

export async function generatePlanAction(
  previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const validatedFields = planFormSchema.safeParse({
    numberOfDays: formData.get("numberOfDays"),
    dietaryPreferences: formData.get("dietaryPreferences"),
    calorieTarget: formData.get("calorieTarget"),
    allergies: formData.get("allergies"),
    cuisine: formData.get("cuisine"),
    generationSource: formData.get("generationSource"),
    ingredients: formData.get("ingredients"),
  });

  if (!validatedFields.success) {
    return {
      message: "Validation failed.",
      errors: validatedFields.error.flatten().fieldErrors,
      isSuccess: false,
      mealPlan: null,
    };
  }

  const input: GenerateLongTermMealPlanInput = {
    ...validatedFields.data,
    allergies: validatedFields.data.allergies || "none",
    availableRecipes: formData.get("recipes") as string,
  };

  try {
    const result = await generateLongTermMealPlan(input);
    const mealPlan: Omit<MealPlan, "id" | "createdAt"> = {
      days: result.days,
      dietaryPreferences: validatedFields.data.dietaryPreferences,
      calorieTarget: validatedFields.data.calorieTarget,
      allergies: validatedFields.data.allergies,
      cuisine: validatedFields.data.cuisine,
    };
    return {
      message: "Plan generated successfully",
      errors: null,
      isSuccess: true,
      mealPlan: JSON.stringify(mealPlan),
    };
  } catch (e: any) {
    return {
      message: "Failed to generate plan.",
      errors: e.message,
      isSuccess: false,
      mealPlan: null,
    };
  }
}

export async function saveMealPlan(
  planData: Omit<MealPlan, "id" | "createdAt">,
): Promise<{ success: boolean; message: string }> {
  try {
    const finalDays: DailyPlan[] = await Promise.all(
      planData.days.map(async (day) => {
        const breakfast = await processMeal(
          day.breakfast,
          "breakfast",
          planData.cuisine,
        );
        const lunch = await processMeal(
          day.lunch,
          "lunch",
          planData.cuisine,
        );
        const dinner = await processMeal(
          day.dinner,
          "dinner",
          planData.cuisine,
        );
        return { breakfast, lunch, dinner };
      }),
    );

    await addMealPlan({ ...planData, days: finalDays, createdAt: new Date() });
    return { success: true, message: "Plan saved successfully." };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

async function processMeal(
  meal: DailyPlan[keyof DailyPlan],
  mealType: string,
  cuisine: string,
) {
  if (meal.id.startsWith("new-recipe-")) {
    const recipeDetails: RecipeDetails = await generateRecipeDetails({
      prompt: `A ${cuisine} ${meal.title} recipe suitable for ${mealType}. Description: ${meal.description}`,
    });
    const newRecipeId = await addRecipe(recipeDetails);
    return { ...meal, id: newRecipeId, title: recipeDetails.name };
  }
  return meal;
}
