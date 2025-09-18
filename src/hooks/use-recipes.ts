'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Recipe } from '@/lib/types';
import { getRecipes as fetchRecipes } from '@/services/recipe-service';
import { addRecipeAction, updateRecipeAction } from '@/app/(app)/recipes/actions';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';

export const useRecipes = () => {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();

  const loadRecipes = useCallback(async () => {
    if (!user) return;
    try {
      const fetchedRecipes = await fetchRecipes(user.uid);
      setRecipes(fetchedRecipes);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      toast({
        title: 'Error',
        description: 'Could not fetch your recipes.',
        variant: 'destructive',
      });
    } finally {
      setIsLoaded(true);
    }
  }, [user, toast]);

  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  const addRecipe = useCallback(
    async (newRecipe: Omit<Recipe, 'id' | 'imageId'>): Promise<Recipe | null> => {
      if (!user) {
        toast({
          title: 'Not Authenticated',
          description: 'You must be logged in to add a recipe.',
          variant: 'destructive',
        });
        return null;
      }
      try {
        const newRecipeId = await addRecipeAction(newRecipe, user.uid);
        const addedRecipe = { ...newRecipe, id: newRecipeId, imageId: '' };
        setRecipes(prev => [...prev, addedRecipe]);
        toast({
          title: 'Success!',
          description: 'Your recipe has been added.',
        });
        return addedRecipe;
      } catch (error) {
        console.error('Error adding recipe:', error);
        toast({
          title: 'Error',
          description: 'Could not add your recipe.',
          variant: 'destructive',
        });
        return null;
      }
    },
    [user, toast]
  );
  
  const updateRecipe = useCallback(
    async (id: string, recipeData: Omit<Recipe, 'id' | 'imageId'>) => {
       if (!user) {
        toast({
          title: 'Not Authenticated',
          description: 'You must be logged in to update a recipe.',
          variant: 'destructive',
        });
        return;
      }
      try {
        await updateRecipeAction(id, recipeData);
        setRecipes((prev) => prev.map(r => r.id === id ? { ...r, ...recipeData } : r));
        toast({
          title: 'Success!',
          description: 'Recipe updated successfully.',
        });
        
      } catch (error) {
         console.error('Error updating recipe:', error);
        toast({
          title: 'Error',
          description: 'Could not update the recipe.',
          variant: 'destructive',
        });
      }
    },
    [user, toast]
  );

  return { recipes, addRecipe, updateRecipe, isLoaded, refreshRecipes: loadRecipes };
};
