"use server";
/**
 * @fileOverview Regenerates a single meal within a daily meal plan.
 *
 * - regenerateSingleMeal - A function that generates a new meal to replace an existing one.
 * - RegenerateSingleMealInput - The input type for the function.
 * - RegenerateSingleMealOutput - The return type for the function.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

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

const RegenerateSingleMealInputSchema = z.object({
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
    .describe("The source for recipe generation."),
  mealToRegenerate: z
    .enum(["breakfast", "lunch", "dinner"])
    .describe("The specific meal to regenerate."),
  currentMeals: z
    .object({
      breakfast: MealSchema.optional(),
      lunch: MealSchema.optional(),
      dinner: MealSchema.optional(),
    })
    .describe(
      "The other meals in the day that are not being regenerated, to provide context.",
    ),
  mealToReplace: MealSchema.describe(
    "The meal that the user wants to replace.",
  ),
  language: z
    .string()
    .optional()
    .describe("The language for the recipe to be generated in, e.g., 'Malay'."),
});

export type RegenerateSingleMealInput = z.infer<
  typeof RegenerateSingleMealInputSchema
>;
export type RegenerateSingleMealOutput = z.infer<typeof MealSchema>;

export async function regenerateSingleMeal(
  input: RegenerateSingleMealInput,
): Promise<RegenerateSingleMealOutput> {
  return regenerateSingleMealFlow(input);
}

const prompt = ai.definePrompt({
  name: "regenerateSingleMealPrompt",
  input: { schema: RegenerateSingleMealInputSchema },
  output: { schema: MealSchema },
  prompt: `You are a nutritionist tasked with revising a daily meal plan for a user.
  The user wants to regenerate their {{{mealToRegenerate}}}.

  **Crucially, you MUST generate a new recipe that is different from the previous one, which was "{{mealToReplace.title}}".**

  User's Preferences:
  - Dietary Preferences: {{{dietaryPreferences}}}
  - Cuisine Style: {{{cuisine}}}
  - Daily Calorie Target: Approximately {{{calorieTarget}}} calories.
  - Allergies (MUST NOT INCLUDE): {{{allergies}}}
  {{#if ingredients}}
  - Ingredients on hand: {{{ingredients}}}
  {{/if}}

  {{#if language}}
  If you generate any new recipes, the entire recipe output (title, description) MUST be in the following language: {{{language}}}.
  {{else}}
  Any new recipes you generate MUST be in English.
  {{/if}}

  Context of the current plan:
  The user is keeping the following meals for the day:
  {{#if currentMeals.breakfast}}
  - Breakfast: "{{currentMeals.breakfast.title}}" ({{currentMeals.breakfast.calories}} calories)
  {{/if}}
  {{#if currentMeals.lunch}}
  - Lunch: "{{currentMeals.lunch.title}}" ({{currentMeals.lunch.calories}} calories)
  {{/if}}
  {{#if currentMeals.dinner}}
  - Dinner: "{{currentMeals.dinner.title}}" ({{currentMeals.dinner.calories}} calories)
  {{/if}}

  Your Task:
  - Generate a new recipe for the {{{mealToRegenerate}}}.
  - The new meal should be different from "{{mealToReplace.title}}".
  - The new meal should complement the existing meals and align with the user's preferences.
  - Try to make the total daily calories (new meal + existing meals) come close to the {{{calorieTarget}}}.

  Recipe Generation Source: {{{generationSource}}}
  - If 'catalog', you MUST choose from the list of available recipes.
  - If 'new', you MUST generate a brand new recipe. DO NOT use the available recipes.
  - If 'combined', you can use the available recipes or generate a new one.

  {{#if availableRecipes}}
  Available recipes (JSON string):
  {{{availableRecipes}}}
  {{/if}}

  Return a single JSON object for the new {{{mealToRegenerate}}} meal.
  The meal object must have an "id", "title", "description", and "calories".
  - If you select a recipe from the catalog, the "id" MUST be the original id.
  - If you generate a new recipe, the "id" should be a placeholder like "new-recipe-{{mealToRegenerate}}".`,
});

const regenerateSingleMealFlow = ai.defineFlow(
  {
    name: "regenerateSingleMealFlow",
    inputSchema: RegenerateSingleMealInputSchema,
    outputSchema: MealSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  },
);
