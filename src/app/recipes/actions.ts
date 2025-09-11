
"use server";

import type { RecipeDetails } from "@/lib/types";
import { generateRecipe } from "@/ai/flows/generate-recipe";
import { updateRecipe, addRecipe } from "@/services/recipe-service";
import { revalidatePath } from "next/cache";

export async function generateRecipeAction(input: { prompt: string }) {
  return await generateRecipe(input);
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
  revalidatePath("/recipes", "layout");
}
