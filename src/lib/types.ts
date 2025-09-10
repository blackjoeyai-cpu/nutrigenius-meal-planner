import type { Timestamp } from "firebase/firestore";

export type Recipe = {
  id: string;
  name: string;
  cuisine: string;
  dietaryTags: string[];
  ingredients: { item: string; quantity: string }[];
  instructions: string[];
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  servings: number;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  imageId: string;
};

export type UserProfile = {
  name: string;
  dietaryPreferences: string;
  allergies: string;
  calorieTarget: number;
};

export type DailyMealPlan = {
    breakfast: { id: string; title: string, calories: number };
    lunch: { id: string; title: string, calories: number };
    dinner: { id: string; title: string, calories: number };
};

export type LongTermMealPlan = {
    id: string;
    userId: string;
    createdAt: string; // Changed from Timestamp to string for serialization
    days: DailyMealPlan[];
    dietaryPreferences: string;
    calorieTarget: number;
    allergies: string;
    cuisine: string;
}
