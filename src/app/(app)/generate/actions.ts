'use server';

import { generateSafeMealPlan } from '@/ai/flows/avoid-allergic-recipes';
import { regenerateSingleMeal } from '@/ai/flows/regenerate-single-meal';
import { addMealPlan, updateMealPlan } from '@/services/meal-plan-service';
import type { Recipe, RecipeDetails, DailyPlan } from '@/lib/types';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { generateMultipleRecipes } from '@/ai/flows/generate-multiple-recipes';
import { addRecipesInBatch } from '@/services/recipe-service';

const MealPlanSchema = z.object({
  dietaryPreferences: z.string(),
  calorieTarget: z.coerce
    .number()
    .min(100, 'Calorie target must be at least 100.'),
  allergies: z.string(),
  cuisine: z.string(),
  ingredients: z.string().optional(),
  recipes: z.string().optional(),
  generationSource: z.enum(['catalog', 'new', 'combined']),
  language: z.string().optional(),
  userId: z.string(),
});

export async function createMealPlan(prevState: unknown, formData: FormData) {
  const validatedFields = MealPlanSchema.safeParse({
    dietaryPreferences: formData.get('dietaryPreferences'),
    calorieTarget: formData.get('calorieTarget'),
    allergies: formData.get('allergies'),
    cuisine: formData.get('cuisine'),
    ingredients: formData.get('ingredients'),
    recipes: formData.get('recipes'),
    generationSource: formData.get('generationSource'),
    language: formData.get('language'),
    userId: formData.get('userId'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data.',
      errors: validatedFields.error.flatten().fieldErrors,
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
      generationSource,
      language,
    } = validatedFields.data;
    const availableRecipes: Recipe[] = recipes ? JSON.parse(recipes) : [];

    const result = await generateSafeMealPlan({
      dietaryPreferences,
      calorieTarget,
      allergies: allergies || 'none',
      cuisine,
      ingredients: ingredients || 'none',
      availableRecipes: JSON.stringify(availableRecipes, null, 2),
      generationSource,
      language: language,
    });

    const fullPlan = {
      days: [{ ...result }],
      dietaryPreferences,
      calorieTarget,
      allergies,
      cuisine,
      generationSource,
    };

    return {
      message: 'Successfully generated meal plan.',
      errors: null,
      mealPlan: JSON.stringify(fullPlan),
    };
  } catch (error) {
    console.error('Error generating meal plan:', error);
    return {
      message: 'An unexpected error occurred while generating the meal plan.',
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
  generationSource: z.enum(['catalog', 'new', 'combined']),
  mealToRegenerate: z.enum(['breakfast', 'lunch', 'dinner']),
  currentMeals: z.object({
    breakfast: MealSchema.optional(),
    lunch: MealSchema.optional(),
    dinner: MealSchema.optional(),
  }),
  mealToReplace: MealSchema,
  language: z.string().optional(),
});

export async function regenerateMealAction(
  input: z.infer<typeof RegenerateMealSchema>
) {
  const validatedFields = RegenerateMealSchema.safeParse(input);

  if (!validatedFields.success) {
    console.error(
      'Regeneration validation error:',
      validatedFields.error.flatten()
    );
    return { success: false, message: 'Invalid input.' };
  }

  try {
    const newMeal = await regenerateSingleMeal(validatedFields.data);

    // We do not save the recipe here, just return the placeholder
    return { success: true, meal: newMeal };
  } catch (error) {
    console.error('Error regenerating meal:', error);
    return { success: false, message: 'Failed to regenerate meal.' };
  }
}

const DailyMealPlanSaveSchema = z.object({
  days: z.array(
    z.object({
      breakfast: z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        calories: z.number(),
      }),
      lunch: z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        calories: z.number(),
      }),
      dinner: z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        calories: z.number(),
      }),
    })
  ),
  dietaryPreferences: z.string(),
  calorieTarget: z.coerce.number(),
  allergies: z.string(),
  cuisine: z.string(),
  generationSource: z.string(),
  planId: z.string().optional(),
  date: z.string().optional(),
  language: z.string().optional(),
  userId: z.string(),
});

export async function saveDailyPlan(
  plan: z.infer<typeof DailyMealPlanSaveSchema>
) {
  const validatedFields = DailyMealPlanSaveSchema.safeParse(plan);

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Invalid plan data provided for saving.',
    };
  }

  try {
    const { planId, date, language, userId, ...planData } =
      validatedFields.data;
    const day = planData.days[0];

    // 1. Identify all new recipes that need to be generated for the day
    const newRecipePrompts: { id: string; prompt: string }[] = [];
    for (const mealType of ['breakfast', 'lunch', 'dinner'] as const) {
      const meal = day[mealType];
      if (meal.id.startsWith('new-recipe-')) {
        newRecipePrompts.push({
          id: meal.id,
          prompt: `A ${planData.cuisine} ${meal.title} for ${mealType} that is ${planData.dietaryPreferences} and fits a ${planData.calorieTarget} calorie diet.`,
        });
      }
    }

    const newRecipeDetailsByPlaceholderId = new Map<string, RecipeDetails>();
    let generatedRecipes: RecipeDetails[] = [];

    // 2. Batch generate all new recipes if any
    if (newRecipePrompts.length > 0) {
      const result = await generateMultipleRecipes({
        prompts: newRecipePrompts,
        language: language,
      });
      generatedRecipes = result.recipes as RecipeDetails[];
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
    const placeholderIdToNewIdMap = new Map<string, string>();
    generatedRecipes.forEach((details, index) => {
      placeholderIdToNewIdMap.set(details.id, newRecipeIds[index]);
    });

    // 4. Create the final plan with real recipe IDs
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

    const planToSave = {
      createdAt: date ? new Date(date) : new Date(),
      days: [resolvedDay],
      dietaryPreferences: planData.dietaryPreferences,
      calorieTarget: planData.calorieTarget,
      allergies: planData.allergies,
      cuisine: planData.cuisine,
    };

    if (planId) {
      await updateMealPlan(planId, planToSave, userId);
    } else {
      await addMealPlan(planToSave, userId);
    }

    revalidatePath('/plans');

    return {
      success: true,
      message: 'Plan saved successfully!',
    };
  } catch (error) {
    console.error('Error saving daily plan:', error);
    return {
      success: false,
      message: 'An unexpected error occurred while saving the plan.',
    };
  }
}
