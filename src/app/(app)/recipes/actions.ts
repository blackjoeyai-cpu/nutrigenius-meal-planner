"use server";

import { generateRecipe } from "@/ai/flows/generate-recipe";
import { addRecipe, updateRecipe } from "@/services/recipe-service";
import { z } from "zod";
import type { Recipe } from "@/lib/types";

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
    throw new Error("Invalid input for recipe generation.");
  }

  const recipeDetails = await generateRecipe(validatedFields.data);

  return recipeDetails;
}

export async function addRecipeAction(recipe: Omit<Recipe, "id" | "imageId">) {
  return await addRecipe(recipe);
}

export async function updateRecipeAction(
  id: string,
  recipe: Omit<Recipe, "id" | "imageId">,
) {
  return await updateRecipe(id, recipe);
}