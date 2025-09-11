
"use client";

import Link from "next/link";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RecipeFilter } from "@/components/recipe-filter";
import type { Recipe } from "@/lib/types";

export function RecipesList({
  recipes,
  initialQuery,
  initialCuisine,
  initialMealType,
}: {
  recipes: Recipe[];
  initialQuery: string;
  initialCuisine: string;
  initialMealType: string;
}) {
  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch =
      initialQuery === "" ||
      recipe.name.toLowerCase().includes(initialQuery.toLowerCase()) ||
      (recipe.ingredients &&
        recipe.ingredients.some((ing) =>
          ing.item.toLowerCase().includes(initialQuery.toLowerCase()),
        ));
    const matchesCuisine =
      initialCuisine === "Any" || recipe.cuisine === initialCuisine;
    const matchesMealType =
      initialMealType === "All" ||
      (recipe.mealTypes && recipe.mealTypes.includes(initialMealType));
    return matchesSearch && matchesCuisine && matchesMealType;
  });

  return (
    <div className="space-y-6">
      <RecipeFilter
        initialCuisine={initialCuisine}
        initialMealType={initialMealType}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredRecipes.map((recipe) => (
          <Link
            key={recipe.id}
            href={`/recipes/${recipe.id}`}
            className="group"
          >
            <Card className="animate-in fade-in-0 h-full overflow-hidden transition-all group-hover:shadow-lg">
              <CardContent className="p-4">
                <CardTitle className="mb-2 font-headline text-lg">
                  {recipe.name}
                </CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{recipe.cuisine}</Badge>
                  {recipe.dietaryTags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      {filteredRecipes.length === 0 && (
        <div className="col-span-full mt-4 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-24 text-center">
          <h3 className="text-xl font-semibold">No Recipes Found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filters.
          </p>
        </div>
      )}
    </div>
  );
}

export function RecipesSkeleton() {
  return (
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index}>
          <CardContent className="space-y-3 p-4">
            <Skeleton className="h-6 w-3/4" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
