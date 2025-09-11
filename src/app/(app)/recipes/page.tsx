"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddRecipeDialog } from "@/components/add-recipe-dialog";
import { useRecipes } from "@/hooks/use-recipes";
import { CUISINES } from "@/lib/constants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/hooks/use-translation";

export default function RecipesPage() {
  const { recipes, addRecipe, isLoaded } = useRecipes();
  const [searchTerm, setSearchTerm] = useState("");
  const [cuisineFilter, setCuisineFilter] = useState("Any");
  const [activeTab, setActiveTab] = useState("All");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { t } = useTranslation();

  const filteredRecipes = useMemo(() => {
    if (!isLoaded) return [];
    return recipes.filter((recipe) => {
      const matchesSearch =
        recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (recipe.ingredients &&
          recipe.ingredients.some((ing) =>
            ing.item.toLowerCase().includes(searchTerm.toLowerCase()),
          ));
      const matchesCuisine =
        cuisineFilter === "Any" || recipe.cuisine === cuisineFilter;
      const matchesMealType =
        activeTab === "All" ||
        (recipe.mealTypes && recipe.mealTypes.includes(activeTab));
      return matchesSearch && matchesCuisine && matchesMealType;
    });
  }, [searchTerm, cuisineFilter, recipes, isLoaded, activeTab]);

  const mealTypes = ["All", "Breakfast", "Lunch", "Dinner"];

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
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onRecipeAdd={(newRecipe) => {
            addRecipe(newRecipe);
            setIsAddDialogOpen(false);
          }}
        >
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("add_recipe")}
          </Button>
        </AddRecipeDialog>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <Input
          placeholder={t("search_recipes_placeholder")}
          className="flex-grow"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select value={cuisineFilter} onValueChange={setCuisineFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder={t("filter_by_cuisine")} />
          </SelectTrigger>
          <SelectContent>
            {CUISINES.map((cuisine) => (
              <SelectItem key={cuisine} value={cuisine}>
                {cuisine}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          {mealTypes.map((type) => (
            <TabsTrigger key={type} value={type}>
              {type}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={activeTab}>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {!isLoaded
              ? Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index}>
                    <CardContent className="space-y-3 p-4">
                      <Skeleton className="h-6 w-3/4" />
                      <div className="flex flex-wrap gap-2">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-5 w-24" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              : filteredRecipes.map((recipe) => {
                  return (
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
                  );
                })}
          </div>
          {filteredRecipes.length === 0 && isLoaded && (
            <div className="col-span-full mt-4 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-24 text-center">
              <h3 className="text-xl font-semibold">{t("no_recipes_found")}</h3>
              <p className="text-muted-foreground">
                {t("no_recipes_found_desc")}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
