"use client";

import { useState, useEffect, useCallback } from "react";
import type { Recipe } from "@/lib/types";
import { recipes as defaultRecipes } from "@/lib/data";

const USER_RECIPES_STORAGE_KEY = "nutriGeniusUserRecipes";

export const useRecipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>(defaultRecipes);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(USER_RECIPES_STORAGE_KEY);
      const userRecipes = item ? JSON.parse(item) : [];
      setRecipes((prevRecipes) => [...prevRecipes, ...userRecipes]);
    } catch (error) {
      console.warn(`Error reading user recipes from localStorage:`, error);
    }
    setIsLoaded(true);
  }, []);

  const addRecipe = useCallback((newRecipe: Omit<Recipe, 'id' | 'imageId'>) => {
    setRecipes((currentRecipes) => {
      const fullRecipe: Recipe = {
          ...newRecipe,
          id: `user-${Date.now()}`,
          imageId: `recipe-${Math.floor(Math.random() * 9) + 1}`, // Assign a random existing image
      };
      
      const updatedRecipes = [...currentRecipes, fullRecipe];

      try {
        const userRecipes = updatedRecipes.filter(r => r.id.startsWith('user-'));
        window.localStorage.setItem(USER_RECIPES_STORAGE_KEY, JSON.stringify(userRecipes));
      } catch (error) {
        console.error(`Error saving user recipes to localStorage:`, error);
      }

      return updatedRecipes;
    });
  }, []);

  return { recipes, addRecipe, isLoaded };
};
