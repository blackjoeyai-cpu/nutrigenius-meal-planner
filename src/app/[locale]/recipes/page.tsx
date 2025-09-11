
import { Suspense } from "react";
import { Link } from "next-intl/navigation";
import { PlusCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddRecipeDialog } from "@/components/add-recipe-dialog";
import { getRecipes } from "@/services/recipe-service";
import { Skeleton } from "@/components/ui/skeleton";
import { RecipeFilter } from "@/components/recipe-filter";
import {
  refreshRecipesAction,
  addRecipeAction,
} from "@/app/[locale]/recipes/actions";
import type { Recipe } from "@/lib/types";

async function RecipesList({
  query,
  cuisine,
  mealType,
}: {
  query: string;
  cuisine: string;
  mealType: string;
}) {
  const recipes = await getRecipes();
  const t = await getTranslations("RecipesPage");

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch =
      query === "" ||
      recipe.name.toLowerCase().includes(query.toLowerCase()) ||
      (recipe.ingredients &&
        recipe.ingredients.some((ing) =>
          ing.item.toLowerCase().includes(query.toLowerCase()),
        ));
    const matchesCuisine = cuisine === "Any" || recipe.cuisine === cuisine;
    const matchesMealType =
      mealType === "All" ||
      (recipe.mealTypes && recipe.mealTypes.includes(mealType));
    return matchesSearch && matchesCuisine && matchesMealType;
  });

  return (
    <>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          <h3 className="text-xl font-semibold">{t("no_recipes_found")}</h3>
          <p className="text-muted-foreground">{t("no_recipes_found_desc")}</p>
        </div>
      )}
    </>
  );
}

function RecipesSkeleton() {
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

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: {
    query?: string;
    cuisine?: string;
    mealType?: string;
  };
}) {
  const t = await getTranslations("RecipesPage");
  const query = searchParams.query || "";
  const cuisine = searchParams.cuisine || "Any";
  const mealType = searchParams.mealType || "All";

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="space-y-2">
          <h2 className="font-headline text-3xl font-bold tracking-tight">
            {t("browse_recipes")}
          </h2>
          <p className="text-muted-foreground">
            {t("browse_recipes_description")}
          </p>
        </div>
        <AddRecipeDialog onRecipeAdd={addRecipeAction} onRecipeUpdate={refreshRecipesAction}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("add_recipe")}
          </Button>
        </AddRecipeDialog>
      </div>
      <RecipeFilter initialCuisine={cuisine} initialMealType={mealType} />
      <Suspense fallback={<RecipesSkeleton />}>
        <RecipesList query={query} cuisine={cuisine} mealType={mealType} />
      </Suspense>
    </div>
  );
}
