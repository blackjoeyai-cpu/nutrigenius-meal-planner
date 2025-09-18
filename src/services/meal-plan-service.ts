'use server';

import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  doc,
  getDoc,
  updateDoc,
  where,
  type Timestamp,
} from 'firebase/firestore';
import type { DailyPlan, MealPlan } from '@/lib/types';

type MealPlanForDb = {
  userId: string;
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
  plan: Omit<MealPlanForDb, 'userId'>,
  userId: string
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'mealplans'), {
      ...plan,
      userId,
    });
    return docRef.id;
  } catch (e) {
    console.error('Error adding meal plan: ', e);
    throw new Error('Could not add meal plan to the database.');
  }
}

export async function updateMealPlan(
  planId: string,
  updatedPlanData: Partial<Omit<MealPlanForDb, 'userId'>>,
  userId: string
): Promise<void> {
  try {
    const planRef = doc(db, 'mealplans', planId);
    const planSnap = await getDoc(planRef);

    if (!planSnap.exists() || planSnap.data().userId !== userId) {
      throw new Error('Permission denied or meal plan not found.');
    }

    await updateDoc(planRef, updatedPlanData);
  } catch (e) {
    console.error('Error updating meal plan: ', e);
    throw new Error('Could not update meal plan in the database.');
  }
}

/**
 * Retrieves all meal plans for a specific user from the Firestore database.
 */
export async function getMealPlans(userId: string): Promise<MealPlan[]> {
  try {
    if (!userId) {
      console.warn('getMealPlans called without a userId.');
      return [];
    }
    const q = query(collection(db, 'mealplans'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const plans: MealPlan[] = [];
    querySnapshot.forEach(doc => {
      const data = doc.data();
      let createdAt: Date;
      const createdAtData = data.createdAt;

      if (createdAtData && typeof createdAtData.toDate === 'function') {
        // It's a Firestore Timestamp
        createdAt = createdAtData.toDate();
      } else if (typeof createdAtData === 'string') {
        // It's an ISO string
        createdAt = new Date(createdAtData);
      } else {
        // Fallback for unexpected format
        createdAt = new Date(0);
      }

      plans.push({
        id: doc.id,
        ...data,
        createdAt,
      } as MealPlan);
    });

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
