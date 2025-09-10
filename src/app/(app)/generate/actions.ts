
"use server";

import { generateSafeMealPlan } from "@/ai/flows/avoid-allergic-recipes";
import { addMealPlan } from "@/services/meal-plan-service";
import type { Recipe } from "@/lib/types";
import { z } from "zod";

const MealPlanSchema = z.object({
  dietaryPreferences: z.string(),
  calorieTarget: z.coerce.number().min(100, "Calorie target must be at least 100."),
  allergies: z.string(),
  cuisine: z.string(),
  ingredients: z.string().optional(),
  recipes: z.string().optional(),
});

export async function createMealPlan(prevState: any, formData: FormData) {
  const validatedFields = MealPlanSchema.safeParse({
    dietaryPreferences: formData.get("dietaryPreferences"),
    calorieTarget: formData.get("calorieTarget"),
    allergies: formData.get("allergies"),
    cuisine: formData.get("cuisine"),
    ingredients: formData.get("ingredients"),
    recipes: formData.get("recipes"),
  });

  if (!validatedFields.success) {
    return {
      message: "Invalid form data.",
      errors: validatedFields.error.flatten().fieldErrors,
      mealPlan: null,
    };
  }

  try {
    const { dietaryPreferences, calorieTarget, allergies, cuisine, ingredients, recipes } = validatedFields.data;
    const availableRecipes: Recipe[] = recipes ? JSON.parse(recipes) : [];
    
    const result = await generateSafeMealPlan({
      dietaryPreferences,
      calorieTarget,
      allergies: allergies || "none",
      cuisine,
      ingredients: ingredients || "none",
      availableRecipes: JSON.stringify(availableRecipes, null, 2),
    });

    // Assume a userId, in a real app this would come from auth
    const userId = "anonymous"; 
    await addMealPlan({
      breakfast: { id: result.breakfast.id, title: result.breakfast.title },
      lunch: { id: result.lunch.id, title: result.lunch.title },
      dinner: { id: result.dinner.id, title: result.dinner.title },
      date: new Date(),
      userId,
    });

    return {
      message: "Successfully generated meal plan.",
      errors: null,
      mealPlan: JSON.stringify(result),
    };
  } catch (error) {
    console.error("Error generating meal plan:", error);
    return {
      message: "An unexpected error occurred while generating the meal plan.",
      errors: null,
      mealPlan: null,
    };
  }
}
