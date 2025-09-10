
"use server";

import { db } from "@/lib/firebase";
import type { Recipe } from "@/lib/types";
import { collection, addDoc, getDocs, doc, getDoc } from "firebase/firestore";

/**
 * Adds a new recipe to the Firestore database.
 * @param recipe - The recipe object to add.
 * @returns The ID of the newly created recipe.
 */
export async function addRecipe(recipe: Omit<Recipe, 'id' | 'imageId'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, "recipes"), {
        ...recipe,
        imageId: `recipe-${Math.floor(Math.random() * 9) + 1}`,
    });
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw new Error("Could not add recipe to the database.");
  }
}

/**
 * Retrieves all recipes from the Firestore database.
 * @returns A promise that resolves to an array of recipes.
 */
export async function getRecipes(): Promise<Recipe[]> {
    const querySnapshot = await getDocs(collection(db, "recipes"));
    const recipes: Recipe[] = [];
    querySnapshot.forEach((doc) => {
        recipes.push({ id: doc.id, ...doc.data() } as Recipe);
    });
    return recipes;
}

/**
 * Retrieves a single recipe by its ID from the Firestore database.
 * @param id - The ID of the recipe to retrieve.
 * @returns A promise that resolves to the recipe object, or null if not found.
 */
export async function getRecipeById(id: string): Promise<Recipe | null> {
    const docRef = doc(db, "recipes", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Recipe;
    } else {
        return null;
    }
}
