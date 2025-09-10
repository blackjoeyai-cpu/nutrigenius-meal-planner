"use server";

import { generateSafeMealPlan } from "@/ai/flows/avoid-allergic-recipes";
import { z } from "zod";

const MealPlanSchema = z.object({
  dietaryPreferences: z.string(),
  calorieTarget: z.coerce.number().min(100, "Calorie target must be at least 100."),
  allergies: z.string(),
});

export async function createMealPlan(prevState: any, formData: FormData) {
  const validatedFields = MealPlanSchema.safeParse({
    dietaryPreferences: formData.get("dietaryPreferences"),
    calorieTarget: formData.get("calorieTarget"),
    allergies: formData.get("allergies"),
  });

  if (!validatedFields.success) {
    return {
      message: "Invalid form data.",
      errors: validatedFields.error.flatten().fieldErrors,
      mealPlan: null,
    };
  }

  try {
    const { dietaryPreferences, calorieTarget, allergies } = validatedFields.data;
    
    const result = await generateSafeMealPlan({
      dietaryPreferences,
      calorieTarget,
      allergies: allergies || "none",
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
