"use server";
/**
 * @fileOverview Generates a personalized meal plan based on user dietary preferences, calorie targets, and restrictions.
 *
 * - generatePersonalizedMealPlan - A function that generates a personalized meal plan.
 * - GeneratePersonalizedMealPlanInput - The input type for the generatePersonalizedMealPlan function.
 * - GeneratePersonalizedMealPlanOutput - The return type for the generatePersonalizedMealPlan function.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const GeneratePersonalizedMealPlanInputSchema = z.object({
  dietaryPreferences: z
    .string()
    .describe(
      "The dietary preferences of the user (e.g., vegetarian, vegan, paleo).",
    ),
  calorieTarget: z
    .number()
    .describe("The daily calorie target for the meal plan."),
  dietaryRestrictions: z
    .string()
    .describe(
      "Any dietary restrictions or allergies of the user (e.g., gluten-free, nut allergy).",
    ),
});
export type GeneratePersonalizedMealPlanInput = z.infer<
  typeof GeneratePersonalizedMealPlanInputSchema
>;

const GeneratePersonalizedMealPlanOutputSchema = z.object({
  mealPlan: z
    .string()
    .describe(
      "A detailed meal plan including breakfast, lunch, and dinner recipes.",
    ),
});
export type GeneratePersonalizedMealPlanOutput = z.infer<
  typeof GeneratePersonalizedMealPlanOutputSchema
>;

export async function generatePersonalizedMealPlan(
  input: GeneratePersonalizedMealPlanInput,
): Promise<GeneratePersonalizedMealPlanOutput> {
  return generatePersonalizedMealPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: "generatePersonalizedMealPlanPrompt",
  input: { schema: GeneratePersonalizedMealPlanInputSchema },
  output: { schema: GeneratePersonalizedMealPlanOutputSchema },
  prompt: `You are a personal nutritionist who creates personalized meal plans based on user preferences and restrictions.

  Based on the following dietary preferences: {{{dietaryPreferences}}},
  Calorie target: {{{calorieTarget}}},
  Dietary restrictions: {{{dietaryRestrictions}}},

  Create a meal plan for the user.
  The meal plan should include breakfast, lunch, and dinner recipes, and the total calorie count should be close to the target.
  Recipes should adhere to specified dietary restrictions.
  Return the meal plan as a string.
  `,
});

const generatePersonalizedMealPlanFlow = ai.defineFlow(
  {
    name: "generatePersonalizedMealPlanFlow",
    inputSchema: GeneratePersonalizedMealPlanInputSchema,
    outputSchema: GeneratePersonalizedMealPlanOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  },
);
