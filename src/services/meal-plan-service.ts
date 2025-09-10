
"use server";

import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where, orderBy, Timestamp } from "firebase/firestore";
import type { DailyMealPlan, LongTermMealPlan } from "@/lib/types";

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

type LongTermMealPlanForDb = {
    userId: string;
    createdAt: Date;
    days: DailyMealPlan[];
    dietaryPreferences: string;
    calorieTarget: number;
    allergies: string;
    cuisine: string;
}

/**
 * Adds a new long-term meal plan to the Firestore database.
 */
export async function addLongTermMealPlan(plan: LongTermMealPlanForDb): Promise<string> {
    try {
        const docRef = await addDoc(collection(db, "longTermMealPlans"), plan);
        return docRef.id;
    } catch (e) {
        console.error("Error adding long-term meal plan: ", e);
        throw new Error("Could not add long-term meal plan to the database.");
    }
}


/**
 * Retrieves all long-term meal plans for a user from the Firestore database.
 */
export async function getLongTermMealPlans(userId: string): Promise<LongTermMealPlan[]> {
    try {
        const q = query(
            collection(db, "longTermMealPlans"), 
            where("userId", "==", userId)
        );
        const querySnapshot = await getDocs(q);
        const plans: LongTermMealPlan[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const createdAtTimestamp = data.createdAt as Timestamp;
            plans.push({ 
                id: doc.id, 
                ...data,
                // Convert timestamp to a serializable format (ISO string)
                createdAt: createdAtTimestamp.toDate().toISOString(),
             } as LongTermMealPlan);
        });

        // Sort the plans by creation date in descending order (newest first)
        plans.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
        });

        return plans;
    } catch(e) {
        console.error("Error fetching long-term meal plans: ", e);
        throw new Error("Could not fetch long-term meal plans.");
    }
}
