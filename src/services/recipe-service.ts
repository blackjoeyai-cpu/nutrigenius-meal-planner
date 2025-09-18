'use server';

import { db } from '@/lib/firebase';
import type { Recipe } from '@/lib/types';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
} from 'firebase/firestore';

/**
 * Adds a new recipe to the Firestore database.
 * @param recipe - The recipe object to add.
 * @returns The ID of the newly created recipe.
 */
export async function addRecipe(
  recipe: Omit<Recipe, 'id' | 'imageId'>,
  userId: string
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'recipes'), {
      ...recipe,
      userId,
      imageId: `recipe-${Math.floor(Math.random() * 9) + 1}`,
    });
    return docRef.id;
  } catch (e) {
    console.error('Error adding document: ', e);
    throw new Error('Could not add recipe to the database.');
  }
}

/**
 * Updates an existing recipe in the Firestore database.
 * @param id - The ID of the recipe to update.
 * @param recipe - The updated recipe data.
 */
export async function updateRecipe(
  id: string,
  recipe: Omit<Recipe, 'id' | 'imageId' | 'userId'>,
  userId: string
): Promise<void> {
  try {
    const recipeRef = doc(db, 'recipes', id);
    const docSnap = await getDoc(recipeRef);

    if (!docSnap.exists() || docSnap.data().userId !== userId) {
      throw new Error('Permission denied or recipe not found.');
    }

    await updateDoc(recipeRef, recipe);
  } catch (e) {
    console.error('Error updating document: ', e);
    throw new Error('Could not update recipe in the database.');
  }
}

/**
 * Retrieves all recipes for a specific user from the Firestore database.
 * @returns A promise that resolves to an array of recipes.
 */
export async function getRecipes(userId: string): Promise<Recipe[]> {
  if (!userId) return [];
  const q = query(collection(db, 'recipes'), where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  const recipes: Recipe[] = [];
  querySnapshot.forEach(doc => {
    recipes.push({ id: doc.id, ...doc.data() } as Recipe);
  });
  return recipes;
}

/**
 * Retrieves a single recipe by its ID from the Firestore database.
 * @param id - The ID of the recipe to retrieve.
 * @param userId - The ID of the user requesting the recipe.
 * @returns A promise that resolves to the recipe object, or null if not found or not owned by the user.
 */
export async function getRecipeById(
  id: string,
  userId: string
): Promise<Recipe | null> {
  const docRef = doc(db, 'recipes', id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const recipe = { id: docSnap.id, ...docSnap.data() } as Recipe;
    if (recipe.userId === userId) {
      return recipe;
    }
  }

  return null;
}
