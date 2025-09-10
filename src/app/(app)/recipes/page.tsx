
'use client';
import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AddRecipeDialog } from '@/components/add-recipe-dialog';
import { useRecipes } from '@/hooks/use-recipes';
import { CUISINES } from '@/lib/constants';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const getImage = (id: string) => {
  return PlaceHolderImages.find((img) => img.id === id);
};

export default function RecipesPage() {
  const { recipes, addRecipe, isLoaded } = useRecipes();
  const [searchTerm, setSearchTerm] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState('Any');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredRecipes = useMemo(() => {
    if (!isLoaded) return [];
    return recipes.filter((recipe) => {
      const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (recipe.ingredients && recipe.ingredients.some(ing => ing.item.toLowerCase().includes(searchTerm.toLowerCase())));
      const matchesCuisine = cuisineFilter === 'Any' || recipe.cuisine === cuisineFilter;
      return matchesSearch && matchesCuisine;
    });
  }, [searchTerm, cuisineFilter, recipes, isLoaded]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight font-headline">
            Browse Recipes
          </h2>
          <p className="text-muted-foreground">
            Find or create your next favorite meal from our collection.
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
            Add Recipe
          </Button>
        </AddRecipeDialog>
      </div>
      <div className="flex flex-col gap-4 md:flex-row">
        <Input
          placeholder="Search recipes or ingredients..."
          className="flex-grow"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select value={cuisineFilter} onValueChange={setCuisineFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by cuisine" />
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredRecipes.map((recipe) => {
          const image = getImage(recipe.imageId);
          return (
            <Link key={recipe.id} href={`/recipes/${recipe.id}`} className="group">
              <Card className="h-full overflow-hidden transition-all group-hover:shadow-lg">
                <CardHeader className="p-0">
                  <div className="relative h-48 w-full">
                    {image && (
                      <Image
                        src={image.imageUrl}
                        alt={recipe.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        data-ai-hint={image.imageHint}
                      />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="mb-2 text-lg font-headline">{recipe.name}</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{recipe.cuisine}</Badge>
                    {recipe.dietaryTags.map((tag) => (
                      <Badge key={tag} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
       {filteredRecipes.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-24 text-center">
            <h3 className="text-xl font-semibold">No Recipes Found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters.</p>
          </div>
        )}
    </div>
  );
}
