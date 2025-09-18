'use server';
/**
 * @fileOverview Generates multiple complete recipes from a list of user prompts.
 *
 * - generateMultipleRecipes - A function that creates multiple recipes.
 * - GenerateMultipleRecipesInput - The input type for the function.
 * - GenerateMultipleRecipesOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { CUISINES, DIETARY_PREFERENCES, MEAL_TYPES } from '@/lib/constants';

const RecipePromptSchema = z.object({
  id: z
    .string()
    .describe(
      'A temporary ID for the recipe request, e.g., "new-recipe-day-1-breakfast".'
    ),
  prompt: z
    .string()
    .describe('The user’s idea or prompt for the recipe to be generated.'),
});

const GenerateMultipleRecipesInputSchema = z.object({
  prompts: z
    .array(RecipePromptSchema)
    .describe('An array of recipe prompts to generate.'),
  language: z
    .string()
    .optional()
    .describe("The language for the recipes to be generated in, e.g., 'Malay'."),
});
export type GenerateMultipleRecipesInput = z.infer<
  typeof GenerateMultipleRecipesInputSchema
>;

const RecipeDetailsSchema = z.object({
  id: z
    .string()
    .describe(
      'The temporary ID from the input prompt that this recipe corresponds to.'
    ),
  name: z.string().describe('The name of the recipe.'),
  cuisine: z
    .enum(CUISINES as [string, ...string[]])
    .describe('The cuisine of the recipe.'),
  mealTypes: z
    .array(z.enum(MEAL_TYPES as [string, ...string[]]))
    .describe(
      'A list of meal types for the recipe (e.g., Breakfast, Lunch, Dinner).'
    ),
  dietaryTags: z
    .array(z.enum(DIETARY_PREFERENCES as [string, ...string[]]))
    .describe('A list of dietary tags for the recipe.'),
  ingredients: z
    .array(
      z.object({
        quantity: z
          .string()
          .describe(
            "The quantity of the ingredient (e.g., '1 cup', '2 tbsp')."
          ),
        item: z.string().describe('The name of the ingredient.'),
      })
    )
    .describe('A list of ingredients for the recipe.'),
  instructions: z
    .array(z.string())
    .describe('A list of step-by-step instructions for preparing the recipe.'),
  prepTime: z.number().describe('The preparation time in minutes.'),
  cookTime: z.number().describe('The cooking time in minutes.'),
  servings: z.number().describe('The number of servings the recipe makes.'),
  nutrition: z
    .object({
      calories: z.number().describe('The calorie count per serving.'),
      protein: z.number().describe('The protein amount in grams per serving.'),
      carbs: z
        .number()
        .describe('The carbohydrate amount in grams per serving.'),
      fat: z.number().describe('The fat amount in grams per serving.'),
    })
    .describe('Nutritional information per serving.'),
});

const GenerateMultipleRecipesOutputSchema = z.object({
  recipes: z.array(RecipeDetailsSchema),
});
export type GenerateMultipleRecipesOutput = z.infer<
  typeof GenerateMultipleRecipesOutputSchema
>;
export type GeneratedRecipeDetails = z.infer<typeof RecipeDetailsSchema>;

export async function generateMultipleRecipes(
  input: GenerateMultipleRecipesInput
): Promise<GenerateMultipleRecipesOutput> {
  return generateMultipleRecipesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMultipleRecipesPrompt',
  input: { schema: GenerateMultipleRecipesInputSchema },
  output: { schema: GenerateMultipleRecipesOutputSchema },
  prompt: `You are a creative chef who specializes in creating new and exciting recipes in bulk.
  A user will provide you with a list of prompts for recipes, and you must generate a complete, well-structured recipe for each one.
  {{#if language}}
  The entire recipe output for all recipes, including the name, ingredients, and instructions, MUST be in the following language: {{{language}}}.
  {{else}}
  The entire recipe output MUST be in English.
  {{/if}}

  The user has requested the following recipes:
  {{#each prompts}}
  - (ID: {{this.id}}) {{this.prompt}}
  {{/each}}

  For each recipe, please generate the following:
  - A creative and appealing name.
  - The most appropriate cuisine, meal types, and dietary tags from the available options.
  - A list of ingredients with quantities.
  - Clear, step-by-step instructions.
  - Estimated prep time, cook time, and number of servings.
  - A reasonable estimate of the nutritional information per serving.

  Return a single JSON object with a "recipes" key, containing an array of all the generated recipes.
  Each recipe object in the array MUST include the original temporary "id" from the prompt.
  The cuisine must be one of: ${CUISINES.join(', ')}.
  The meal types must be from this list: ${MEAL_TYPES.join(', ')}.
  The dietary tags must be from this list: ${DIETARY_PREFERENCES.join(', ')}.
  `,
});

const generateMultipleRecipesFlow = ai.defineFlow(
  {
    name: 'generateMultipleRecipesFlow',
    inputSchema: GenerateMultipleRecipesInputSchema,
    outputSchema: GenerateMultipleRecipesOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate recipes from AI.');
    }
    return output;
  }
);
