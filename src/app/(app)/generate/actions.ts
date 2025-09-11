
"use server";

import { generateSafeMealPlan } from "@/ai/flows/avoid-allergic-recipes";
import { regenerateSingleMeal } from "@/ai/flows/regenerate-single-meal";
import { addMealPlan, updateMealPlan } from "@/services/meal-plan-service";
import type { Recipe, DailyPlan } from "@/lib/types";
import { z } from "zod";
import { revalidatePath } from "next/cache";

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

    const fullPlan = {
      days: [{ ...result }],
      dietaryPreferences,
      calorieTarget,
      allergies,
      cuisine,
      generationSource,
    }

    return {
      message: "Successfully generated meal plan.",
      errors: null,
      mealPlan: JSON.stringify(fullPlan),
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

const MealSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  calories: z.number(),
});

const RegenerateMealSchema = z.object({
    dietaryPreferences: z.string(),
    calorieTarget: z.coerce.number(),
    allergies: z.string(),
    cuisine: z.string(),
    ingredients: z.string().optional(),
    availableRecipes: z.string(),
    generationSource: z.enum(["catalog", "new", "combined"]),
    mealToRegenerate: z.enum(["breakfast", "lunch", "dinner"]),
    currentMeals: z.object({
        breakfast: MealSchema.optional(),
        lunch: MealSchema.optional(),
        dinner: MealSchema.optional(),
    }),
    mealToReplace: MealSchema,
});

export async function regenerateMealAction(input: z.infer<typeof RegenerateMealSchema>) {
    const validatedFields = RegenerateMealSchema.safeParse(input);

    if (!validatedFields.success) {
        console.error("Regeneration validation error:", validatedFields.error.flatten());
        return { success: false, message: "Invalid input." };
    }

    try {
        const newMeal = await regenerateSingleMeal(validatedFields.data);
        return { success: true, meal: newMeal };
    } catch (error) {
        console.error("Error regenerating meal:", error);
        return { success: false, message: "Failed to regenerate meal." };
    }
}


const DailyMealPlanSaveSchema = z.object({
    days: z.array(z.object({
        breakfast: z.object({ id: z.string(), title: z.string(), description: z.string(), calories: z.number() }),
        lunch: z.object({ id: z.string(), title: z.string(), description: z.string(), calories: z.number() }),
        dinner: z.object({ id: z.string(), title: z.string(), description: z.string(), calories: z.number() }),
    })),
    dietaryPreferences: z.string(),
    calorieTarget: z.coerce.number(),
    allergies: z.string(),
    cuisine: z.string(),
    generationSource: z.string(),
    planId: z.string().optional(),
    date: z.string().optional(),
});

export async function saveDailyPlan(plan: z.infer<typeof DailyMealPlanSaveSchema>) {
    const validatedFields = DailyMealPlanSaveSchema.safeParse(plan);

    if (!validatedFields.success) {
        return {
            success: false,
            message: "Invalid plan data provided for saving.",
        };
    }
    
    try {
        const { planId, date, ...planData } = validatedFields.data;
        const userId = "anonymous";
        const planToSave = {
            userId,
            createdAt: date ? new Date(date) : new Date(),
            days: planData.days,
            dietaryPreferences: planData.dietaryPreferences,
            calorieTarget: planData.calorieTarget,
            allergies: planData.allergies,
            cuisine: planData.cuisine,
        };

        if (planId) {
            await updateMealPlan(planId, planToSave);
        } else {
            await addMealPlan(planToSave);
        }

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
