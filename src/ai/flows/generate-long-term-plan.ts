"use server";

/**
 * @fileOverview Generates a multi-day meal plan based on user preferences.
 *
 * - generateLongTermMealPlan - A function that generates a meal plan for a specified number of days.
 * - GenerateLongTermMealPlanInput - The input type for the function.
 * - GenerateLongTermMealPlanOutput - The return type for the function.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const GenerateLongTermMealPlanInputSchema = z.object({
  dietaryPreferences: z
    .string()
    .describe("The user’s dietary preferences (e.g., vegetarian, vegan)."),
  calorieTarget: z.number().describe("The user’s daily calorie target."),
  allergies: z
    .string()
    .describe("A comma-separated list of ingredients the user is allergic to."),
  cuisine: z
    .string()
    .describe(
      "The desired cuisine for the meal plan (e.g., Italian, Mexican).",
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
  numberOfDays: z
    .number()
    .int()
    .min(1)
    .max(30)
    .describe("The number of days to generate the meal plan for."),
  generationSource: z
    .enum(["catalog", "new", "combined"])
    .describe(
      "The source for recipe generation. 'catalog' uses only available recipes. 'new' generates all new recipes. 'combined' uses available recipes first, then generates new ones if necessary.",
    ),
});
export type GenerateLongTermMealPlanInput = z.infer<
  typeof GenerateLongTermMealPlanInputSchema
>;

const MealSchema = z.object({
  id: z
    .string()
    .describe(
      'The ID of the recipe. If from the available list, use the original ID. If newly generated, use a placeholder like "new-recipe-day-1-breakfast".',
    ),
  title: z.string().describe("The name of the meal."),
  description: z.string().describe("A short description of the meal."),
  calories: z.number().describe("The estimated calorie count for the meal."),
});

const DailyPlanSchema = z.object({
  breakfast: MealSchema,
  lunch: MealSchema,
  dinner: MealSchema,
});

const GenerateLongTermMealPlanOutputSchema = z.object({
  days: z.array(DailyPlanSchema).describe("An array of daily meal plans."),
});
export type GenerateLongTermMealPlanOutput = z.infer<
  typeof GenerateLongTermMealPlanOutputSchema
>;

export async function generateLongTermMealPlan(
  input: GenerateLongTermMealPlanInput,
): Promise<GenerateLongTermMealPlanOutput> {
  return generateLongTermMealPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: "generateLongTermMealPlanPrompt",
  input: { schema: GenerateLongTermMealPlanInputSchema },
  output: { schema: GenerateLongTermMealPlanOutputSchema },
  prompt: `You are a nutritionist creating a long-term meal plan for a user.

  Plan Duration: Create a meal plan for {{{numberOfDays}}} days.
  Dietary Preferences: {{{dietaryPreferences}}}.
  Cuisine Style: {{{cuisine}}}.
  Daily Calorie Target: Approximately {{{calorieTarget}}} calories per day.
  Allergies: The user is allergic to the following, so you MUST NOT include them: {{{allergies}}}.
  {{#if ingredients}}
  The meal plan should try to incorporate the following ingredients that the user has on hand: {{{ingredients}}}.
  {{/if}}

  Recipe Generation Source: {{{generationSource}}}
  - If 'catalog', you MUST choose from the list of available recipes. Ensure variety and try not to repeat meals too often.
  - If 'new', you MUST generate all brand new recipes that fit the user's criteria for the entire duration. DO NOT use the available recipes.
  - If 'combined', you MUST prioritize using the available recipes. Only generate new recipes if you run out of suitable options in the catalog for the plan's duration.

  {{#if availableRecipes}}
  This is the list of available recipes, provided as a JSON string. Each recipe has a unique "id".
  {{{availableRecipes}}}
  {{/if}}

  Ensure variety in the meals across the days. Do not repeat the same meal for lunch or dinner on consecutive days if possible.

  For each of the {{{numberOfDays}}} days, create a detailed meal plan with breakfast, lunch, and dinner.
  Return the entire plan as a single JSON object. The root object should have a "days" key, which is an array of daily plans.
  Each daily plan object should contain "breakfast", "lunch", and "dinner" objects.
  Each meal object MUST have an "id", "title", "description", and "calories".
  - If you select a recipe from the catalog, the "id" MUST be the original id from that recipe.
  - If you generate a new recipe, the "id" should be a placeholder like "new-recipe-day-1-breakfast", "new-recipe-day-2-lunch", etc.`,
});

const generateLongTermMealPlanFlow = ai.defineFlow(
  {
    name: "generateLongTermMealPlanFlow",
    inputSchema: GenerateLongTermMealPlanInputSchema,
    outputSchema: GenerateLongTermMealPlanOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  },
);
