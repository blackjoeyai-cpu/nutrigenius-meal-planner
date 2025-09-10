"use client";

import { useState, useEffect } from "react";
import { recipes } from "@/lib/data";

export const useIngredients = () => {
    const [ingredients, setIngredients] = useState<string[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const allIngredients = recipes.flatMap(recipe => recipe.ingredients.map(ing => ing.item));
        const uniqueIngredients = [...new Set(allIngredients)].sort();
        setIngredients(uniqueIngredients);
        setIsLoaded(true);
    }, []);

    return { ingredients, isLoaded };
};
