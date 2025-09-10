
"use server";

import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export type MealPlan = {
    breakfast: { id: string; title: string };
    lunch: { id: string; title: string };
    dinner: { id: string; title: string };
    date: Date;
    userId: string; // Assuming you have user IDs
};

/**
 * Adds a new meal plan to the Firestore database.
 * @param mealPlan - The meal plan object to add.
 * @returns The ID of the newly created meal plan.
 */
export async function addMealPlan(mealPlan: Omit<MealPlan, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, "mealPlans"), mealPlan);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw new Error("Could not add meal plan to the database.");
  }
}
