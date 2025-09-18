
'use server';

import { z } from 'zod';
import { generateLongTermMealPlan } from '@/ai/flows/generate-long-term-plan';
import { addMealPlan } from '@/services/meal-plan-service';
import type { Recipe, MealPlan, RecipeDetails, DailyPlan } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { addRecipesInBatch } from '@/services/recipe-service';
import { generateMultipleRecipes } from '@/ai/flows/generate-multiple-recipes';

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
  startDate: z.coerce.date(),
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
      ? ingredientsValue.split(',').filter(i => i.trim() !== '')
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
    startDate: formData.get('startDate'),
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
      startDate,
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
        createdAt: startDate.toISOString(),
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
  plan: Omit<MealPlan, 'id' | 'userId'>,
  userId: string
) {
  const newRecipePrompts: { id: string; prompt: string }[] = [];

  // 1. Identify all new recipes that need to be generated
  for (const day of plan.days) {
    for (const mealType of ['breakfast', 'lunch', 'dinner'] as const) {
      const meal = day[mealType];
      if (meal.id.startsWith('new-recipe-')) {
        newRecipePrompts.push({
          id: meal.id,
          prompt: `A ${plan.cuisine} ${meal.title} for ${mealType} that is ${plan.dietaryPreferences} and fits a ${plan.calorieTarget} calorie diet.`,
        });
      }
    }
  }

  const newRecipeDetailsByPlaceholderId = new Map<string, RecipeDetails>();
  let generatedRecipes: RecipeDetails[] = [];

  // 2. Batch generate all new recipes if any
  if (newRecipePrompts.length > 0) {
    const result = await generateMultipleRecipes({
      prompts: newRecipePrompts,
      language: (plan as any).language,
    });
    generatedRecipes = result.recipes as RecipeDetails[];

    // Map the results back to their original placeholder IDs
    generatedRecipes.forEach(details => {
      newRecipeDetailsByPlaceholderId.set(details.id, details);
    });
  }

  // 3. Batch save all new recipes to the DB
  const recipesToSave: Omit<Recipe, 'id' | 'imageId' | 'userId'>[] =
    generatedRecipes.map(details => {
      const { id, ...recipeData } = details;
      return recipeData;
    });

  const newRecipeIds =
    recipesToSave.length > 0
      ? await addRecipesInBatch(recipesToSave, userId)
      : [];

  // Create a map from placeholder ID to the new final recipe ID
  const placeholderIdToNewIdMap = new Map<string, string>();
  generatedRecipes.forEach((details, index) => {
    placeholderIdToNewIdMap.set(details.id, newRecipeIds[index]);
  });

  // 4. Create the final plan with real recipe IDs
  const resolvedDays: DailyPlan[] = plan.days.map(day => {
    const resolvedDay: DailyPlan = {
      breakfast: { ...day.breakfast },
      lunch: { ...day.lunch },
      dinner: { ...day.dinner },
    };

    for (const mealType of ['breakfast', 'lunch', 'dinner'] as const) {
      const meal = day[mealType];
      if (placeholderIdToNewIdMap.has(meal.id)) {
        const newRecipeId = placeholderIdToNewIdMap.get(meal.id)!;
        const recipeDetails = newRecipeDetailsByPlaceholderId.get(meal.id)!;
        resolvedDay[mealType] = {
          id: newRecipeId,
          title: recipeDetails.name,
          description: meal.description, // Keep original simple description
          calories: recipeDetails.nutrition.calories,
        };
      }
    }
    return resolvedDay;
  });

  const planToSave = {
    createdAt: new Date(plan.createdAt),
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
