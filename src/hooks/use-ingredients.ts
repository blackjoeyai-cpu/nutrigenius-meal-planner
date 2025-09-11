"use client";

import { useState, useEffect } from "react";
import { useRecipes } from "./use-recipes";

export const useIngredients = () => {
  const { recipes, isLoaded: recipesLoaded } = useRecipes();
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (recipesLoaded) {
      const allIngredients = recipes.flatMap((recipe) =>
        recipe.ingredients.map((ing) => ing.item),
      );
      const uniqueIngredients = [...new Set(allIngredients)].sort();
      setIngredients(uniqueIngredients);
      setIsLoaded(true);
    }
  }, [recipes, recipesLoaded]);

  return { ingredients, isLoaded };
};
