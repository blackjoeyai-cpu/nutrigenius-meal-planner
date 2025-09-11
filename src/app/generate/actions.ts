
"use server";

import { generateSafeMealPlan } from "@/ai/flows/avoid-allergic-recipes";
import { regenerateSingleMeal } from "@/ai/flows/regenerate-single-meal";
import { addMealPlan, updateMealPlan } from "@/services/meal-plan-service";
import { addRecipe } from "@/services/recipe-service";
import type { DailyPlan, MealPlan, RecipeDetails } from "@/lib/types";
import { generateRecipeDetails } from "@/ai/flows/generate-recipe";

type FormState = {
  message: string;
  errors: Record<string, string[]> | null;
  mealPlan: string | null;
};

export async function createMealPlan(
  previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const result = await generateSafeMealPlan({
      dietaryPreferences: formData.get("dietaryPreferences") as string,
      calorieTarget: Number(formData.get("calorieTarget")),
      allergies: (formData.get("allergies") as string) || "none",
      cuisine: formData.get("cuisine") as string,
      ingredients: formData.get("ingredients") as string,
      availableRecipes: formData.get("recipes") as string,
      generationSource: formData.get("generationSource") as
        | "catalog"
        | "new"
        | "combined",
    });

    const mealPlan: Omit<MealPlan, "id" | "createdAt"> = {
      days: [result],
      dietaryPreferences: formData.get("dietaryPreferences") as string,
      calorieTarget: Number(formData.get("calorieTarget")),
      allergies: (formData.get("allergies") as string) || "none",
      cuisine: formData.get("cuisine") as string,
    };

    return {
      message: "Meal plan generated successfully.",
      errors: null,
      mealPlan: JSON.stringify(mealPlan),
    };
  } catch (e: any) {
    return {
      message: "An unexpected error occurred.",
      errors: e.message,
      mealPlan: null,
    };
  }
}

export async function saveDailyPlan(
  planData: Omit<MealPlan, "id" | "createdAt"> & {
    planId?: string;
    date?: string;
  },
): Promise<{ success: boolean; message: string }> {
  try {
    const finalDays: DailyPlan[] = await Promise.all(
      planData.days.map(async (day) => {
        const breakfast = await processMeal(
          day.breakfast,
          "breakfast",
          planData.cuisine,
        );
        const lunch = await processMeal(day.lunch, "lunch", planData.cuisine);
        const dinner = await processMeal(
          day.dinner,
          "dinner",
          planData.cuisine,
        );
        return { breakfast, lunch, dinner };
      }),
    );

    const planToSave = {
      days: finalDays,
      dietaryPreferences: planData.dietaryPreferences,
      calorieTarget: planData.calorieTarget,
      allergies: planData.allergies,
      cuisine: planData.cuisine,
    };

    if (planData.planId && planData.date) {
      await addMealPlan({ ...planToSave, createdAt: new Date() });
    } else {
      await addMealPlan({ ...planToSave, createdAt: new Date() });
    }

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

export async function regenerateMealAction(
  input: any,
): Promise<{ success: boolean; meal?: DailyPlan[keyof DailyPlan]; message?: string }> {
  try {
    const meal = await regenerateSingleMeal(input);
    return { success: true, meal };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}
