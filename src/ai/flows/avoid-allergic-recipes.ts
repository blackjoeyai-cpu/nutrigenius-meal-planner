"use server";

/**
 * @fileOverview Generates meal plans while avoiding recipes with ingredients that the user is allergic to.
 *
 * - generateSafeMealPlan - A function that generates a meal plan, avoiding allergic ingredients.
 * - GenerateSafeMealPlanInput - The input type for the generateSafeMealPlan function.
 * - GenerateSafeMealPlanOutput - The return type for the generateSafeMealPlan function.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const GenerateSafeMealPlanInputSchema = z.object({
  dietaryPreferences: z
    .string()
    .describe(
      "The user’s dietary preferences (e.g., vegetarian, vegan, paleo).",
    ),
  calorieTarget: z.number().describe("The user’s daily calorie target."),
  allergies: z
    .string()
    .describe(
      "A comma-separated list of ingredients the user is allergic to. Example: peanuts, shellfish, dairy.",
    ),
  cuisine: z
    .string()
    .describe(
      "The desired cuisine for the meal plan (e.g., Italian, Mexican, Asian).",
    ),
  ingredients: z
    .string()
    .optional()
    .describe(
      "A comma-separated list of ingredients the user has on hand and would like to use.",
    ),
  availableRecipes: z
    .string()
    .optional()
    .describe("A JSON string of available recipes for the AI to choose from."),
  generationSource: z
    .enum(["catalog", "new", "combined"])
    .describe(
      "The source for recipe generation. 'catalog' uses only available recipes. 'new' generates all new recipes. 'combined' uses available recipes first, then generates new ones if necessary.",
    ),
});
export type GenerateSafeMealPlanInput = z.infer<
  typeof GenerateSafeMealPlanInputSchema
>;

const MealSchema = z.object({
  id: z
    .string()
    .describe(
      'The ID of the recipe. If from the available list, use the original ID. If newly generated, use a placeholder like "new-recipe-1".',
    ),
  title: z.string().describe("The name of the meal."),
  description: z.string().describe("A short description of the meal."),
  calories: z.number().describe("The estimated calorie count for the meal."),
});

const GenerateSafeMealPlanOutputSchema = z.object({
  breakfast: MealSchema,
  lunch: MealSchema,
  dinner: MealSchema,
});
export type GenerateSafeMealPlanOutput = z.infer<
  typeof GenerateSafeMealPlanOutputSchema
>;

export async function generateSafeMealPlan(
  input: GenerateSafeMealPlanInput,
): Promise<GenerateSafeMealPlanOutput> {
  return generateSafeMealPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: "generateSafeMealPlanPrompt",
  input: { schema: GenerateSafeMealPlanInputSchema },
  output: { schema: GenerateSafeMealPlanOutputSchema },
  prompt: `You are a nutritionist creating a meal plan for a user.

  The meal plan should adhere to the following dietary preferences: {{{dietaryPreferences}}}.
  The meal plan should be of the following cuisine style: {{{cuisine}}}.
  The meal plan should have approximately {{{calorieTarget}}} calories per day.
  The meal plan MUST NOT include any of the following ingredients, as the user is allergic to them: {{{allergies}}}.
  {{#if ingredients}}
  The meal plan should try to incorporate the following ingredients that the user has on hand: {{{ingredients}}}.
  {{/if}}

  Any new recipes you generate MUST be in English.

  Recipe Generation Source: {{{generationSource}}}
  - If 'catalog', you MUST choose from the list of available recipes.
  - If 'new', you MUST generate three brand new recipes that fit the user's criteria. DO NOT use the available recipes.
  - If 'combined', you MUST prioritize using the available recipes. Only generate a new recipe if you cannot find a suitable one in the catalog.

  {{#if availableRecipes}}
  This is the list of available recipes, provided as a JSON string. Each recipe has a unique "id".
  {{{availableRecipes}}}
  {{/if}}

  Create a detailed meal plan with breakfast, lunch, and dinner that is safe and appropriate for the user.
  Return the plan as a JSON object with keys "breakfast", "lunch", and "dinner".
  Each meal should have an "id", "title", "description", and "calories".
  - If you select a recipe from the catalog, the "id" MUST be the original id from that recipe.
  - If you generate a new recipe, the "id" should be a placeholder like "new-recipe-breakfast", "new-recipe-lunch", etc.`,
});

const generateSafeMealPlanFlow = ai.defineFlow(
  {
    name: "generateSafeMealPlanFlow",
    inputSchema: GenerateSafeMealPlanInputSchema,
    outputSchema: GenerateSafeMealPlanOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  },
);
