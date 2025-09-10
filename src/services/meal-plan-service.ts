
"use server";

import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where, orderBy, Timestamp } from "firebase/firestore";
import type { DailyPlan, MealPlan } from "@/lib/types";


type MealPlanForDb = {
    userId: string;
    createdAt: Date;
    days: DailyPlan[];
    dietaryPreferences: string;
    calorieTarget: number;
    allergies: string;
    cuisine: string;
}

/**
 * Adds a new meal plan to the Firestore database.
 */
export async function addMealPlan(plan: MealPlanForDb): Promise<string> {
    try {
        const docRef = await addDoc(collection(db, "mealplans"), plan);
        return docRef.id;
    } catch (e) {
        console.error("Error adding meal plan: ", e);
        throw new Error("Could not add meal plan to the database.");
    }
}


/**
 * Retrieves all meal plans for a user from the Firestore database.
 */
export async function getMealPlans(userId: string): Promise<MealPlan[]> {
    try {
        const q = query(
            collection(db, "mealplans"), 
            where("userId", "==", userId)
        );
        const querySnapshot = await getDocs(q);
        const plans: MealPlan[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const createdAtTimestamp = data.createdAt as Timestamp;
            plans.push({ 
                id: doc.id, 
                ...data,
                // Convert timestamp to a serializable format (ISO string)
                createdAt: createdAtTimestamp.toDate().toISOString(),
             } as MealPlan);
        });

        // Sort the plans by creation date in descending order (newest first)
        plans.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
        });

        return plans;
    } catch(e) {
        console.error("Error fetching meal plans: ", e);
        throw new Error("Could not fetch meal plans.");
    }
}
