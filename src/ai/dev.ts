import { config } from 'dotenv';
config();

import '@/ai/flows/generate-personalized-meal-plan.ts';
import '@/ai/flows/avoid-allergic-recipes.ts';
import '@/ai/flows/generate-recipe.ts';
import '@/ai/flows/generate-long-term-plan.ts';
import '@/ai/flows/regenerate-single-meal.ts';
