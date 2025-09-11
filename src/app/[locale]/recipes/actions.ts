"use server";

import type { RecipeDetails } from "@/lib/types";
import { generateRecipe } from "@/ai/flows/generate-recipe";
import { updateRecipe, addRecipe } from "@/services/recipe-service";
import { getLocale } from "next-intl/server";

export async function generateRecipeAction(input: {
  prompt: string;
  language?: string;
}) {
  const locale = await getLocale();
  return await generateRecipe({
    ...input,
    language: locale === "ms" ? "Malay" : undefined,
  });
}

export async function updateRecipeAction(id: string, data: RecipeDetails) {
  return await updateRecipe(id, data);
}

export async function addRecipeAction(data: RecipeDetails) {
  return await addRecipe(data);
}
