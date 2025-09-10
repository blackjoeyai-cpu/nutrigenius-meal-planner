
"use server";

import { generateSafeMealPlan } from "@/ai/flows/avoid-allergic-recipes";
import { addMealPlan as saveMealToDB } from "@/services/meal-plan-service";
import type { Recipe } from "@/lib/types";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { DailyMealPlan } from "@/lib/types";

const MealPlanSchema = z.object({
  dietaryPreferences: z.string(),
  calorieTarget: z.coerce.number().min(100, "Calorie target must be at least 100."),
  allergies: z.string(),
  cuisine: z.string(),
  ingredients: z.string().optional(),
  recipes: z.string().optional(),
  generationSource: z.enum(["catalog", "new", "combined"]),
});

export async function createMealPlan(prevState: any, formData: FormData) {
  const validatedFields = MealPlanSchema.safeParse({
    dietaryPreferences: formData.get("dietaryPreferences"),
    calorieTarget: formData.get("calorieTarget"),
    allergies: formData.get("allergies"),
    cuisine: formData.get("cuisine"),
    ingredients: formData.get("ingredients"),
    recipes: formData.get("recipes"),
    generationSource: formData.get("generationSource"),
  });

  if (!validatedFields.success) {
    return {
      message: "Invalid form data.",
      errors: validatedFields.error.flatten().fieldErrors,
      mealPlan: null,
    };
  }

  try {
    const { dietaryPreferences, calorieTarget, allergies, cuisine, ingredients, recipes, generationSource } = validatedFields.data;
    const availableRecipes: Recipe[] = recipes ? JSON.parse(recipes) : [];
    
    const result = await generateSafeMealPlan({
      dietaryPreferences,
      calorieTarget,
      allergies: allergies || "none",
      cuisine,
      ingredients: ingredients || "none",
      availableRecipes: JSON.stringify(availableRecipes, null, 2),
      generationSource,
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

const DailyMealPlanSaveSchema = z.object({
  breakfast: z.object({ id: z.string(), title: z.string(), calories: z.number() }),
  lunch: z.object({ id: z.string(), title: z.string(), calories: z.number() }),
  dinner: z.object({ id: z.string(), title: z.string(), calories: z.number() }),
});

export async function saveDailyPlan(plan: DailyMealPlan) {
    const validatedFields = DailyMealPlanSaveSchema.safeParse(plan);

    if (!validatedFields.success) {
        return {
            success: false,
            message: "Invalid plan data provided for saving.",
        };
    }
    
    try {
        const userId = "anonymous";
        await saveMealToDB({
          breakfast: { id: plan.breakfast.id, title: plan.breakfast.title },
          lunch: { id: plan.lunch.id, title: plan.lunch.title },
          dinner: { id: plan.dinner.id, title: plan.dinner.title },
          date: new Date(),
          userId,
        });

        revalidatePath("/plans");

        return {
            success: true,
            message: "Plan saved successfully!",
        };
    } catch (error) {
        console.error("Error saving daily plan:", error);
        return {
            success: false,
            message: "An unexpected error occurred while saving the plan.",
        };
    }
}
    
