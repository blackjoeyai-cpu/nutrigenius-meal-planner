'use server';

import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  doc,
  updateDoc,
} from 'firebase/firestore';
import type { DailyPlan, MealPlan } from '@/lib/types';

// Note: userId is no longer used but kept for schema consistency in case auth is re-added.
type MealPlanForDb = {
  userId?: string;
  createdAt: Date;
  days: DailyPlan[];
  dietaryPreferences: string;
  calorieTarget: number;
  allergies: string;
  cuisine: string;
};

/**
 * Adds a new meal plan to the Firestore database.
 */
export async function addMealPlan(
  plan: Omit<MealPlanForDb, 'userId'>
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'mealplans'), {
      ...plan,
      userId: 'anonymous', // Default to anonymous since auth is removed
    });
    return docRef.id;
  } catch (e) {
    console.error('Error adding meal plan: ', e);
    throw new Error('Could not add meal plan to the database.');
  }
}

export async function updateMealPlan(
  planId: string,
  updatedPlanData: Partial<MealPlanForDb>
): Promise<void> {
  try {
    const planRef = doc(db, 'mealplans', planId);
    await updateDoc(planRef, updatedPlanData);
  } catch (e) {
    console.error('Error updating meal plan: ', e);
    throw new Error('Could not update meal plan in the database.');
  }
}

/**
 * Retrieves all meal plans from the Firestore database.
 */
export async function getMealPlans(): Promise<MealPlan[]> {
  try {
    const q = query(collection(db, 'mealplans'));
    const querySnapshot = await getDocs(q);
    const plans: MealPlan[] = [];
    querySnapshot.forEach(doc => {
      const data = doc.data();
      // Ensure createdAt exists and is a timestamp before converting
      const createdAtTimestamp = data.createdAt as
        | import('firebase/firestore').Timestamp
        | undefined;
      const createdAt = createdAtTimestamp
        ? createdAtTimestamp.toDate().toISOString()
        : new Date(0).toISOString(); // Fallback to epoch if missing

      plans.push({
        id: doc.id,
        ...data,
        createdAt,
      } as MealPlan);
    });

    // Optional: Sort on the client side if needed, but be mindful of missing dates.
    plans.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

    return plans;
  } catch (e) {
    console.error('Error fetching meal plans: ', e);
    throw new Error('Could not fetch meal plans.');
  }
}
