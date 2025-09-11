"use server";

import { z } from "zod";
import { generateLongTermMealPlan } from "@/ai/flows/generate-long-term-plan";
import { addMealPlan } from "@/services/meal-plan-service";
import type { Recipe, MealPlan } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { generateRecipe } from "@/ai/flows/generate-recipe";

const GeneratePlanSchema = z.object({
  dietaryPreferences: z.string(),
  calorieTarget: z.coerce
    .number()
    .min(100, "Calorie target must be at least 100."),
  allergies: z.string(),
  cuisine: z.string(),
  ingredients: z.string().optional(),
  recipes: z.string().optional(),
  numberOfDays: z.coerce
    .number()
    .min(1, "Number of days must be at least 1.")
    .max(30, "Cannot generate more than 30 days."),
  generationSource: z.enum(["catalog", "new", "combined"]),
});

export async function generatePlanAction(
  prevState: unknown,
  formData: FormData,
) {
  const validatedFields = GeneratePlanSchema.safeParse({
    dietaryPreferences: formData.get("dietaryPreferences"),
    calorieTarget: formData.get("calorieTarget"),
    allergies: formData.get("allergies"),
    cuisine: formData.get("cuisine"),
    ingredients: formData.get("ingredients"),
    recipes: formData.get("recipes"),
    numberOfDays: formData.get("numberOfDays"),
    generationSource: formData.get("generationSource"),
  });

  if (!validatedFields.success) {
    return {
      message: "Invalid form data.",
      errors: validatedFields.error.flatten().fieldErrors,
      isSuccess: false,
      mealPlan: null,
    };
  }

  try {
    const {
      dietaryPreferences,
      calorieTarget,
      allergies,
      cuisine,
      ingredients,
      recipes,
      numberOfDays,
      generationSource,
    } = validatedFields.data;
    const availableRecipes: Recipe[] = recipes ? JSON.parse(recipes) : [];
    const language = "Malay";

    const result = await generateLongTermMealPlan({
      dietaryPreferences,
      calorieTarget,
      allergies: allergies || "none",
      cuisine,
      ingredients: ingredients || "none",
      availableRecipes: JSON.stringify(availableRecipes, null, 2),
      numberOfDays,
      generationSource,
      language: language,
    });

    for (const day of result.days) {
      for (const mealType of ["breakfast", "lunch", "dinner"] as const) {
        const meal = day[mealType];
        if (meal.id.startsWith("new-recipe-")) {
          const fullRecipe = await generateRecipe({
            prompt: `A ${cuisine} ${meal.title} that is ${dietaryPreferences} and fits a ${calorieTarget} calorie diet.`,
            language: language,
          });
          day[mealType] = {
            id: fullRecipe.id,
            title: fullRecipe.name,
            description: meal.description, // Keep AI's short description
            calories: fullRecipe.nutrition.calories,
          };
        }
      }
    }

    return {
      message: "Successfully generated long-term meal plan.",
      errors: null,
      isSuccess: true,
      mealPlan: JSON.stringify({
        ...result,
        dietaryPreferences,
        calorieTarget,
        allergies,
        cuisine,
        generationSource,
      }),
    };
  } catch (error) {
    console.error("Error generating long-term meal plan:", error);
    return {
      message: "An unexpected error occurred while generating the meal plan.",
      errors: null,
      isSuccess: false,
      mealPlan: null,
    };
  }
}

export async function saveMealPlan(
  plan: Omit<MealPlan, "id" | "createdAt"> & {
    generationSource: string;
  },
) {
  // Only save the meal plan if it was generated purely from the recipe catalog.
  // This ensures data integrity, as we can guarantee all recipe IDs are valid.
  if (plan.generationSource === "catalog") {
    const planToSave = {
      createdAt: new Date(),
      days: plan.days,
      dietaryPreferences: plan.dietaryPreferences,
      calorieTarget: plan.calorieTarget,
      allergies: plan.allergies,
      cuisine: plan.cuisine,
    };

    await addMealPlan(planToSave);
    revalidatePath("/plans");

    return { success: true, message: "Plan saved successfully." };
  }

  return {
    success: false,
    message: "Only plans generated from the catalog can be saved at this time.",
  };
}