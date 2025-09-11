"use client";

import { useState, useEffect, useCallback } from "react";
import type { Recipe } from "@/lib/types";
import { getRecipes } from "@/services/recipe-service";
import { addRecipeAction } from "@/app/[locale]/recipes/actions";

export const useRecipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadRecipes = useCallback(async () => {
    try {
      const fetchedRecipes = await getRecipes();
      setRecipes(fetchedRecipes);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  const addRecipe = useCallback(
    async (newRecipe: Omit<Recipe, "id" | "imageId">) => {
      try {
        await addRecipeAction(newRecipe);
        // Refresh recipes after adding a new one
        await loadRecipes();
      } catch (error) {
        console.error("Error adding recipe:", error);
      }
    },
    [loadRecipes],
  );

  return { recipes, addRecipe, isLoaded, refreshRecipes: loadRecipes };
};
