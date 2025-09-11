
import { Suspense } from "react";
import { PlusCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { AddRecipeDialog } from "@/components/add-recipe-dialog";
import { getRecipes } from "@/services/recipe-service";
import {
  refreshRecipesAction,
  addRecipeAction,
} from "@/app/[locale]/recipes/actions";
import { RecipesList, RecipesSkeleton } from "@/components/recipes-list";

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
  const recipes = await getRecipes();
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
        <AddRecipeDialog
          onRecipeAdd={async (recipe) => {
            "use server";
            await addRecipeAction(recipe);
            await refreshRecipesAction();
          }}
          onRecipeUpdate={async () => {
            "use server";
            await refreshRecipesAction();
          }}
        >
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("add_recipe")}
          </Button>
        </AddRecipeDialog>
      </div>
      <Suspense fallback={<RecipesSkeleton />}>
        <RecipesList
          recipes={recipes}
          initialQuery={query}
          initialCuisine={cuisine}
          initialMealType={mealType}
        />
      </Suspense>
    </div>
  );
}
