'use server';

import { generateRecipeDetails } from '@/ai/flows/generate-recipe';
import {
  addRecipe as addRecipeToDb,
  updateRecipe as updateRecipeInDb,
} from '@/services/recipe-service';
import { z } from 'zod';
import type { Recipe } from '@/lib/types';

const GenerateRecipeSchema = z.object({
  prompt: z.string(),
  language: z.string().optional(),
});

export async function generateRecipeAction(input: {
  prompt: string;
  language?: string;
}) {
  const validatedFields = GenerateRecipeSchema.safeParse(input);

  if (!validatedFields.success) {
    throw new Error('Invalid input for recipe generation.');
  }

  const recipeDetails = await generateRecipeDetails(validatedFields.data);

  return recipeDetails;
}

export async function addRecipeAction(
  recipe: Omit<Recipe, 'id' | 'imageId'>,
  userId: string
) {
  return await addRecipeToDb(recipe, userId);
}

export async function updateRecipeAction(
  id: string,
  recipe: Omit<Recipe, 'id' | 'imageId' | 'userId'>,
  userId: string
) {
  return await updateRecipeInDb(id, recipe, userId);
}
