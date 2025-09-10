
"use client";

import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Clock, Users, Soup, Flame, Beef, Wheat, Droplets } from 'lucide-react';
import { useRecipes } from '@/hooks/use-recipes';

import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

const getImage = (id: string) => {
  return PlaceHolderImages.find((img) => img.id === id);
};

export default function RecipeDetailPage({ params }: { params: { id: string } }) {
  const { recipes, isLoaded } = useRecipes();
  
  const recipe = isLoaded ? recipes.find((recipe) => recipe.id === params.id) : undefined;

  if (!isLoaded) {
    return (
        <div className="mx-auto max-w-4xl space-y-8">
            <div className="space-y-4">
                <Skeleton className="h-64 w-full rounded-lg md:h-96" />
                <Skeleton className="h-10 w-3/4" />
                <div className="flex flex-wrap items-center gap-4">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-24" />
                </div>
                <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                </div>
            </div>
            <Separator />
             <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <div className="md:col-span-1 space-y-4">
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                </div>
                <div className="md:col-span-2 space-y-4">
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                </div>
            </div>
        </div>
    );
  }

  if (!recipe) {
    notFound();
  }

  const image = getImage(recipe.imageId);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="space-y-4">
        <div className="relative h-64 w-full overflow-hidden rounded-lg md:h-96">
          {image && (
            <Image
              src={image.imageUrl}
              alt={recipe.name}
              fill
              className="object-cover"
              data-ai-hint={image.imageHint}
            />
          )}
        </div>
        <h1 className="text-4xl font-bold font-headline">{recipe.name}</h1>
        <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Prep: {recipe.prepTime} min</span>
          </div>
          <div className="flex items-center gap-2">
            <Soup className="h-4 w-4" />
            <span>Cook: {recipe.cookTime} min</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Servings: {recipe.servings}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{recipe.cuisine}</Badge>
          {recipe.dietaryTags.map((tag) => (
            <Badge key={tag} variant="outline">{tag}</Badge>
          ))}
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <h2 className="mb-4 text-2xl font-semibold font-headline">Ingredients</h2>
          <ul className="space-y-2">
            {recipe.ingredients.map((ing, index) => (
              <li key={index} className="flex gap-2">
                <span className="font-semibold">{ing.quantity}</span>
                <span>{ing.item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-2">
          <h2 className="mb-4 text-2xl font-semibold font-headline">Instructions</h2>
          <ol className="list-inside list-decimal space-y-4">
            {recipe.instructions.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>
      </div>
      
      <Separator />

      <div>
        <h2 className="mb-4 text-2xl font-semibold font-headline">Nutritional Information</h2>
        <p className="mb-4 text-muted-foreground">Per serving</p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Flame className="mx-auto mb-2 h-6 w-6 text-primary" />
              <p className="text-sm text-muted-foreground">Calories</p>
              <p className="text-lg font-bold">{recipe.nutrition.calories}</p>
            </CardContent>
          </Card>
           <Card>
            <CardContent className="p-4 text-center">
              <Beef className="mx-auto mb-2 h-6 w-6 text-primary" />
              <p className="text-sm text-muted-foreground">Protein</p>
              <p className="text-lg font-bold">{recipe.nutrition.protein}g</p>
            </CardContent>
          </Card>
           <Card>
            <CardContent className="p-4 text-center">
              <Wheat className="mx-auto mb-2 h-6 w-6 text-primary" />
              <p className="text-sm text-muted-foreground">Carbs</p>
              <p className="text-lg font-bold">{recipe.nutrition.carbs}g</p>
            </CardContent>
          </Card>
           <Card>
            <CardContent className="p-4 text-center">
              <Droplets className="mx-auto mb-2 h-6 w-6 text-primary" />
              <p className="text-sm text-muted-foreground">Fat</p>
              <p className="text-lg font-bold">{recipe.nutrition.fat}g</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
