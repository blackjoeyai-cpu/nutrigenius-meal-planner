
"use server";

import { db } from "@/lib/firebase";
import type { Recipe } from "@/lib/types";
import { collection, addDoc, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";

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
 * Updates an existing recipe in the Firestore database.
 * @param id - The ID of the recipe to update.
 * @param recipe - The updated recipe data.
 */
export async function updateRecipe(id: string, recipe: Omit<Recipe, 'id' | 'imageId'>): Promise<void> {
    try {
        const recipeRef = doc(db, "recipes", id);
        await updateDoc(recipeRef, recipe);
    } catch (e) {
        console.error("Error updating document: ", e);
        throw new Error("Could not update recipe in the database.");
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
