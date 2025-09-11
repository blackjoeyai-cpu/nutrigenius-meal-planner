
export type Recipe = {
  id: string;
  name: string;
  cuisine: string;
  mealTypes: string[];
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

// Represents a single day's plan as stored within a long-term plan
export type DailyPlan = {
  breakfast: { id: string; title: string; description: string; calories: number; };
  lunch: { id: string; title: string; description: string; calories: number; };
  dinner: { id: string; title: string; description: string; calories: number; };
}

export type MealPlan = {
    id: string;
    userId: string;
    createdAt: string; // Changed from Timestamp to string for serialization
    days: DailyPlan[];
    dietaryPreferences: string;
    calorieTarget: number;
    allergies: string;
    cuisine: string;
}

