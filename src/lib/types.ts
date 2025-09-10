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
