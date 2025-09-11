"use client";

import { useState, useEffect } from "react";
import type { Recipe } from "@/lib/types";

export const useIngredients = (recipes: Recipe[]) => {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (recipes) {
      const allIngredients = recipes.flatMap((recipe) =>
        recipe.ingredients.map((ing) => ing.item),
      );
      const uniqueIngredients = [...new Set(allIngredients)].sort();
      setIngredients(uniqueIngredients);
      setIsLoaded(true);
    }
  }, [recipes]);

  return { ingredients, isLoaded };
};
