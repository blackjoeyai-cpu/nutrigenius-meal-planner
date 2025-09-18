
'use server';

import { z } from 'zod';
import { generateLongTermMealPlan } from '@/ai/flows/generate-long-term-plan';
import { addMealPlan } from '@/services/meal-plan-service';
import type { Recipe, MealPlan, RecipeDetails, DailyPlan } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { addRecipe } from '@/services/recipe-service';
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

  const newRecipeDetailsById = new Map<string, RecipeDetails>();

  // 2. Batch generate all new recipes if any
  if (newRecipePrompts.length > 0) {
    const { recipes: generatedRecipes } = await generateMultipleRecipes({
      prompts: newRecipePrompts,
      language: plan.language,
    });

    // 3. Save new recipes to DB and map their new IDs
    for (const details of generatedRecipes) {
      const recipeData: Omit<Recipe, 'id' | 'imageId' | 'userId'> = {
        name: details.name,
        cuisine: details.cuisine,
        mealTypes: details.mealTypes,
        dietaryTags: details.dietaryTags,
        ingredients: details.ingredients,
        instructions: details.instructions,
        prepTime: details.prepTime,
        cookTime: details.cookTime,
        servings: details.servings,
        nutrition: details.nutrition,
      };
      const newRecipeId = await addRecipe(recipeData, userId);
      newRecipeDetailsById.set(details.id, {
        ...recipeData,
        id: newRecipeId,
      } as RecipeDetails);
    }
  }

  // 4. Create the final plan with real recipe IDs
  const resolvedDays: DailyPlan[] = plan.days.map(day => {
    const resolvedDay: DailyPlan = {
      breakfast: { ...day.breakfast },
      lunch: { ...day.lunch },
      dinner: { ...day.dinner },
    };

    for (const mealType of ['breakfast', 'lunch', 'dinner'] as const) {
      const meal = day[mealType];
      if (newRecipeDetailsById.has(meal.id)) {
        const newDetails = newRecipeDetailsById.get(meal.id)!;
        resolvedDay[mealType] = {
          id: newDetails.id,
          title: newDetails.name,
          description: meal.description, // Keep original simple description
          calories: newDetails.nutrition.calories,
        };
      }
    }
    return resolvedDay;
  });

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
