'use server';

/**
 * @fileOverview Generates meal plans while avoiding recipes with ingredients that the user is allergic to.
 *
 * - generateSafeMealPlan - A function that generates a meal plan, avoiding allergic ingredients.
 * - GenerateSafeMealPlanInput - The input type for the generateSafeMealPlan function.
 * - GenerateSafeMealPlanOutput - The return type for the generateSafeMealPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSafeMealPlanInputSchema = z.object({
  dietaryPreferences: z
    .string()
    .describe('The user’s dietary preferences (e.g., vegetarian, vegan, paleo).'),
  calorieTarget: z.number().describe('The user’s daily calorie target.'),
  allergies: z
    .string()
    .describe(
      'A comma-separated list of ingredients the user is allergic to. Example: peanuts, shellfish, dairy.'
    ),
});
export type GenerateSafeMealPlanInput = z.infer<typeof GenerateSafeMealPlanInputSchema>;

const GenerateSafeMealPlanOutputSchema = z.object({
  mealPlan: z
    .string()
    .describe(
      'A detailed meal plan that adheres to the user’s dietary preferences and calorie target, while excluding all ingredients the user is allergic to.'
    ),
});
export type GenerateSafeMealPlanOutput = z.infer<typeof GenerateSafeMealPlanOutputSchema>;

export async function generateSafeMealPlan(
  input: GenerateSafeMealPlanInput
): Promise<GenerateSafeMealPlanOutput> {
  return generateSafeMealPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSafeMealPlanPrompt',
  input: {schema: GenerateSafeMealPlanInputSchema},
  output: {schema: GenerateSafeMealPlanOutputSchema},
  prompt: `You are a nutritionist creating a meal plan for a user.

  The meal plan should adhere to the following dietary preferences: {{{dietaryPreferences}}}.
  The meal plan should have approximately {{{calorieTarget}}} calories per day.
  The meal plan MUST NOT include any of the following ingredients, as the user is allergic to them: {{{allergies}}}.

  Create a detailed meal plan that is safe and appropriate for the user.`,
});

const generateSafeMealPlanFlow = ai.defineFlow(
  {
    name: 'generateSafeMealPlanFlow',
    inputSchema: GenerateSafeMealPlanInputSchema,
    outputSchema: GenerateSafeMealPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

