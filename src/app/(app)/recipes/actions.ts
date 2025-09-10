
"use server";

import { generateRecipe } from "@/ai/flows/generate-recipe";
import { addRecipe } from "@/services/recipe-service";
import { z } from "zod";

const GenerateRecipeSchema = z.object({
    prompt: z.string(),
});

export async function generateRecipeAction(input: { prompt: string }) {
    const validatedFields = GenerateRecipeSchema.safeParse(input);

    if (!validatedFields.success) {
        throw new Error("Invalid input for recipe generation.");
    }
    
    const recipeDetails = await generateRecipe(validatedFields.data);

    return recipeDetails;
}


export async function addRecipeAction(recipe: Omit<import("@/lib/types").Recipe, "id" | "imageId">) {
    return await addRecipe(recipe);
}
