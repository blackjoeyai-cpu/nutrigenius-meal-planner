"use server";
/**
 * @fileOverview Generates a complete recipe from a user's text description.
 *
 * - generateRecipe - A function that creates a recipe.
 * - GenerateRecipeInput - The input type for the generateRecipe function.
 * - GenerateRecipeOutput - The return type for the generateRecipe function.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";
import { CUISINES, DIETARY_PREFERENCES, MEAL_TYPES } from "@/lib/constants";

const GenerateRecipeInputSchema = z.object({
  prompt: z
    .string()
    .describe("The user’s idea or prompt for the recipe to be generated."),
});
export type GenerateRecipeInput = z.infer<typeof GenerateRecipeInputSchema>;

const GenerateRecipeOutputSchema = z.object({
  name: z.string().describe("The name of the recipe."),
  cuisine: z
    .enum(CUISINES as [string, ...string[]])
    .describe("The cuisine of the recipe."),
  mealTypes: z
    .array(z.enum(MEAL_TYPES as [string, ...string[]]))
    .describe(
      "A list of meal types for the recipe (e.g., Breakfast, Lunch, Dinner).",
    ),
  dietaryTags: z
    .array(z.enum(DIETARY_PREFERENCES as [string, ...string[]]))
    .describe("A list of dietary tags for the recipe."),
  ingredients: z
    .array(
      z.object({
        quantity: z
          .string()
          .describe(
            "The quantity of the ingredient (e.g., '1 cup', '2 tbsp').",
          ),
        item: z.string().describe("The name of the ingredient."),
      }),
    )
    .describe("A list of ingredients for the recipe."),
  instructions: z
    .array(z.string())
    .describe("A list of step-by-step instructions for preparing the recipe."),
  prepTime: z.number().describe("The preparation time in minutes."),
  cookTime: z.number().describe("The cooking time in minutes."),
  servings: z.number().describe("The number of servings the recipe makes."),
  nutrition: z
    .object({
      calories: z.number().describe("The calorie count per serving."),
      protein: z.number().describe("The protein amount in grams per serving."),
      carbs: z
        .number()
        .describe("The carbohydrate amount in grams per serving."),
      fat: z.number().describe("The fat amount in grams per serving."),
    })
    .describe("Nutritional information per serving."),
});

export type GenerateRecipeOutput = z.infer<typeof GenerateRecipeOutputSchema>;

export async function generateRecipe(
  input: GenerateRecipeInput,
): Promise<GenerateRecipeOutput> {
  return generateRecipeFlow(input);
}

const prompt = ai.definePrompt({
  name: "generateRecipePrompt",
  input: { schema: GenerateRecipeInputSchema },
  output: { schema: GenerateRecipeOutputSchema },
  prompt: `You are a creative chef who specializes in creating new and exciting recipes.
  A user will provide you with a prompt for a recipe, and you must generate a complete, well-structured recipe based on their idea.

  User's recipe idea: {{{prompt}}}

  Please generate the following for the recipe:
  - A creative and appealing name.
  - The most appropriate cuisine from the available options.
  - Suitable meal types (e.g., Breakfast, Lunch, Dinner) from the available options.
  - Suitable dietary tags from the available options.
  - A list of ingredients with quantities.
  - Clear, step-by-step instructions.
  - Estimated prep time, cook time, and number of servings.
  - A reasonable estimate of the nutritional information (calories, protein, carbs, fat) per serving.

  Return the complete recipe as a JSON object that matches the specified output schema.
  The cuisine must be one of: ${CUISINES.join(", ")}.
  The meal types must be from this list: ${MEAL_TYPES.join(", ")}.
  The dietary tags must be from this list: ${DIETARY_PREFERENCES.join(", ")}.
  `,
});

const generateRecipeFlow = ai.defineFlow(
  {
    name: "generateRecipeFlow",
    inputSchema: GenerateRecipeInputSchema,
    outputSchema: GenerateRecipeOutputSchema,
    retries: 3,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  },
);
