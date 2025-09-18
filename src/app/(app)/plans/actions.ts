
'use server';

import { z } from 'zod';
import { generateLongTermMealPlan } from '@/ai/flows/generate-long-term-plan';
import { addMealPlan } from '@/services/meal-plan-service';
import type { Recipe, MealPlan, RecipeDetails, DailyPlan } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { generateRecipeDetails } from '@/ai/flows/generate-recipe';
import { addRecipe } from '@/services/recipe-service';

const GeneratePlanSchema = z.object({
  dietaryPreferences: z.string(),
  calorieTarget: z.coerce
    .number()
    .min(100, 'Calorie target must be at least 100.'),
  allergies: z.string(),
  cuisine: z.string().min(1, 'Cuisine is required.'),
  ingredients: z.array(z.string()),
  recipes: z.string().optional(),
  numberOfDays: z.coerce
    .number()
    .min(1, 'Number of days must be at least 1.')
    .max(30, 'Cannot generate more than 30 days.'),
  generationSource: z.enum(['catalog', 'new', 'combined']),
  language: z.string().optional(),
  userId: z.string(),
});

export async function generatePlanAction(
  prevState: unknown,
  formData: FormData
) {
  const ingredientsValue = formData.get('ingredients');
  const ingredients =
    typeof ingredientsValue === 'string' && ingredientsValue
      ? ingredientsValue.split(',')
      : [];

  const validatedFields = GeneratePlanSchema.safeParse({
    dietaryPreferences: formData.get('dietaryPreferences'),
    calorieTarget: formData.get('calorieTarget'),
    allergies: formData.get('allergies'),
    cuisine: formData.get('cuisine'),
    ingredients: ingredients,
    recipes: formData.get('recipes'),
    numberOfDays: formData.get('numberOfDays'),
    generationSource: formData.get('generationSource'),
    language: formData.get('language'),
    userId: formData.get('userId'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data.',
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
      language,
    } = validatedFields.data;
    const availableRecipes: Recipe[] = recipes ? JSON.parse(recipes) : [];

    const result = await generateLongTermMealPlan({
      dietaryPreferences,
      calorieTarget,
      allergies: allergies || 'none',
      cuisine,
      ingredients: ingredients.join(', ') || 'none',
      availableRecipes: JSON.stringify(availableRecipes, null, 2),
      numberOfDays,
      generationSource,
      language: language,
    });

    return {
      message: 'Successfully generated long-term meal plan.',
      errors: null,
      isSuccess: true,
      mealPlan: JSON.stringify({
        ...result,
        dietaryPreferences,
        calorieTarget,
        allergies,
        cuisine,
        generationSource,
        language,
      }),
    };
  } catch (error) {
    console.error('Error generating long-term meal plan:', error);
    return {
      message: 'An unexpected error occurred while generating the meal plan.',
      errors: null,
      isSuccess: false,
      mealPlan: null,
    };
  }
}

export async function saveMealPlan(
  plan: Omit<MealPlan, 'id' | 'createdAt'> & {
    generationSource: string;
    language?: string;
  },
  userId: string
) {
  const resolvedDays: DailyPlan[] = [];

  for (const day of plan.days) {
    const resolvedDay: DailyPlan = {
      breakfast: { ...day.breakfast },
      lunch: { ...day.lunch },
      dinner: { ...day.dinner },
    };

    for (const mealType of ['breakfast', 'lunch', 'dinner'] as const) {
      const meal = day[mealType];
      if (meal.id.startsWith('new-recipe-')) {
        const recipeDetails: RecipeDetails = await generateRecipeDetails({
          prompt: `A ${plan.cuisine} ${meal.title} that is ${plan.dietaryPreferences} and fits a ${plan.calorieTarget} calorie diet.`,
          language: plan.language,
        });

        const newRecipeId = await addRecipe(recipeDetails, userId);

        resolvedDay[mealType] = {
          id: newRecipeId,
          title: recipeDetails.name,
          description: meal.description,
          calories: recipeDetails.nutrition.calories,
        };
      }
    }
    resolvedDays.push(resolvedDay);
  }

  const planToSave = {
    createdAt: new Date(),
    days: resolvedDays,
    dietaryPreferences: plan.dietaryPreferences,
    calorieTarget: plan.calorieTarget,
    allergies: plan.allergies,
    cuisine: plan.cuisine,
  };

  await addMealPlan(planToSave, userId);
  revalidatePath('/plans');

  return { success: true, message: 'Plan saved successfully.' };
}
