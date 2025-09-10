
"use server";

import { z } from "zod";
import { generateLongTermMealPlan } from "@/ai/flows/generate-long-term-plan";
import { addLongTermMealPlan } from "@/services/meal-plan-service";
import type { Recipe } from "@/lib/types";
import { revalidatePath } from "next/cache";

const GeneratePlanSchema = z.object({
  dietaryPreferences: z.string(),
  calorieTarget: z.coerce.number().min(100, "Calorie target must be at least 100."),
  allergies: z.string(),
  cuisine: z.string(),
  recipes: z.string().optional(),
  numberOfDays: z.coerce.number().min(1, "Number of days must be at least 1.").max(30, "Cannot generate more than 30 days."),
});

export async function generatePlanAction(prevState: any, formData: FormData) {
  const validatedFields = GeneratePlanSchema.safeParse({
    dietaryPreferences: formData.get("dietaryPreferences"),
    calorieTarget: formData.get("calorieTarget"),
    allergies: formData.get("allergies"),
    cuisine: formData.get("cuisine"),
    recipes: formData.get("recipes"),
    numberOfDays: formData.get("numberOfDays"),
  });

  if (!validatedFields.success) {
    return {
      message: "Invalid form data.",
      errors: validatedFields.error.flatten().fieldErrors,
      isSuccess: false,
    };
  }

  try {
    const { dietaryPreferences, calorieTarget, allergies, cuisine, recipes, numberOfDays } = validatedFields.data;
    const availableRecipes: Recipe[] = recipes ? JSON.parse(recipes) : [];
    
    const result = await generateLongTermMealPlan({
      dietaryPreferences,
      calorieTarget,
      allergies: allergies || "none",
      cuisine,
      availableRecipes: JSON.stringify(availableRecipes, null, 2),
      numberOfDays,
    });

    const userId = "anonymous";
    const planToSave = {
      userId,
      createdAt: new Date(),
      days: result.days,
      dietaryPreferences,
      calorieTarget,
      allergies,
      cuisine,
    };

    await addLongTermMealPlan(planToSave);

    revalidatePath("/plans");

    return {
      message: "Successfully generated meal plan.",
      errors: null,
      isSuccess: true,
    };

  } catch (error) {
    console.error("Error generating long-term meal plan:", error);
    return {
      message: "An unexpected error occurred while generating the meal plan.",
      errors: null,
      isSuccess: false,
    };
  }
}
