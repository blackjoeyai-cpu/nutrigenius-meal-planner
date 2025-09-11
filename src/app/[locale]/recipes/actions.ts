
"use server";

import type { RecipeDetails } from "@/lib/types";
import { generateRecipe } from "@/ai/flows/generate-recipe";
import { updateRecipe, addRecipe } from "@/services/recipe-service";
import { getLocale } from "next-intl/server";
import { revalidatePath } from "next/cache";

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
  const result = await updateRecipe(id, data);
  revalidatePath("/recipes");
  return result;
}

export async function addRecipeAction(data: RecipeDetails) {
  const result = await addRecipe(data);
  return result;
}

export async function refreshRecipesAction() {
  revalidatePath("/(en|ms)/recipes", "layout");
}
