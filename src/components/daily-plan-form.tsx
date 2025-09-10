
"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from 'next/link';
import { Sparkles, Loader2, Flame, AlertTriangle, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createMealPlan } from "@/app/(app)/generate/actions";
import { DIETARY_PREFERENCES, CUISINES } from "@/lib/constants";
import { MultiSelect } from "@/components/ui/multi-select";
import { useIngredients } from "@/hooks/use-ingredients";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AddRecipeDialog } from "@/components/add-recipe-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { Recipe } from "@/lib/types";
import { useRecipes } from "@/hooks/use-recipes";


const initialState = {
  message: "",
  errors: null,
  mealPlan: null,
};

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled} className="w-full sm:w-auto">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate Meal Plan
        </>
      )}
    </Button>
  );
}

export function DailyPlanForm({ recipes }: { recipes: Recipe[] }) {
  const [state, formAction] = useActionState(createMealPlan, initialState);
  const { ingredients } = useIngredients();
  const { addRecipe } = useRecipes();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Default values
  const [dietaryPreferences, setDietaryPreferences] = useState(DIETARY_PREFERENCES[0]);
  const [calorieTarget, setCalorieTarget] = useState("2000");
  const [allergies, setAllergies] = useState("");
  const [cuisine, setCuisine] = useState(CUISINES[0]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [generationSource, setGenerationSource] = useState("catalog");

  const hasEnoughRecipesForCatalog = recipes.length > 3;
  const isCatalogGenerationBlocked = generationSource === 'catalog' && !hasEnoughRecipesForCatalog;

  const mealPlan = state.mealPlan ? JSON.parse(state.mealPlan) : null;
  const totalCalories = mealPlan ? mealPlan.breakfast.calories + mealPlan.lunch.calories + mealPlan.dinner.calories : 0;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 pt-6">
      <Card>
        <form action={formAction}>
           <input type="hidden" name="ingredients" value={selectedIngredients.join(',')} />
           <input type="hidden" name="recipes" value={JSON.stringify(recipes)} />
          <CardHeader>
            <CardTitle>Create Your Daily Meal Plan</CardTitle>
            <CardDescription>
              Provide your details and let our AI create a personalized meal plan for you.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isCatalogGenerationBlocked && (
                 <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Not Enough Recipes</AlertTitle>
                    <AlertDescription>
                        You need more than 3 recipes in your collection to generate a meal plan from your catalog. 
                        Please add more recipes, or choose a different generation source.
                    </AlertDescription>
                     <div className="mt-4">
                        <AddRecipeDialog
                            open={isAddDialogOpen}
                            onOpenChange={setIsAddDialogOpen}
                            onRecipeAdd={(newRecipe) => {
                                addRecipe(newRecipe);
                                setIsAddDialogOpen(false);
                            }}
                        >
                        <Button type="button" variant="secondary" onClick={() => setIsAddDialogOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Recipe
                        </Button>
                        </AddRecipeDialog>
                     </div>
                </Alert>
            )}
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Generation Source</Label>
                    <RadioGroup name="generationSource" value={generationSource} onValueChange={setGenerationSource} className="gap-2">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="catalog" id="catalog" />
                            <Label htmlFor="catalog">Use my existing recipes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="new" id="new" />
                            <Label htmlFor="new">Generate all new recipes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="combined" id="combined" />
                            <Label htmlFor="combined">Combine existing and new recipes</Label>
                        </div>
                    </RadioGroup>
                </div>
                <div className="space-y-2">
                <Label htmlFor="dietaryPreferences">Dietary Preferences</Label>
                <Select name="dietaryPreferences" value={dietaryPreferences} onValueChange={setDietaryPreferences}>
                    <SelectTrigger id="dietaryPreferences">
                    <SelectValue placeholder="Select a preference" />
                    </SelectTrigger>
                    <SelectContent>
                    {DIETARY_PREFERENCES.map((pref) => (
                        <SelectItem key={pref} value={pref}>
                        {pref}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                </div>
                <div className="space-y-2">
                <Label htmlFor="cuisine">Cuisine</Label>
                <Select name="cuisine" value={cuisine} onValueChange={setCuisine}>
                    <SelectTrigger id="cuisine">
                    <SelectValue placeholder="Select a cuisine" />
                    </SelectTrigger>
                    <SelectContent>
                    {CUISINES.map((c) => (
                        <SelectItem key={c} value={c}>
                        {c}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                </div>
                <div className="space-y-2">
                <Label htmlFor="calorieTarget">Daily Calorie Target</Label>
                <Input
                    id="calorieTarget"
                    name="calorieTarget"
                    type="number"
                    placeholder="e.g., 2000"
                    value={calorieTarget}
                    onChange={(e) => setCalorieTarget(e.target.value)}
                />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="ingredients">Ingredients on Hand</Label>
                    <MultiSelect
                        options={ingredients.map(i => ({ value: i, label: i }))}
                        selected={selectedIngredients}
                        onChange={setSelectedIngredients}
                        className="w-full"
                        placeholder="Select ingredients you have..."
                    />
                    <p className="text-sm text-muted-foreground">
                        Select ingredients you have to be included in the meal plan.
                    </p>
                </div>
                <div className="space-y-2">
                <Label htmlFor="allergies">Allergies or Restrictions</Label>
                <Textarea
                    id="allergies"
                    name="allergies"
                    placeholder="e.g., peanuts, shellfish, dairy"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                    Separate items with a comma.
                </p>
                </div>
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton disabled={isCatalogGenerationBlocked} />
          </CardFooter>
        </form>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold font-headline">Your Generated Plan</h3>
            {mealPlan && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Flame className="h-4 w-4" />
                    <span>Total Calories: {totalCalories}</span>
                </div>
            )}
        </div>

        {mealPlan ? (
          <div className="space-y-4">
             <Link href={`/recipes/${mealPlan.breakfast.id}`} className="group block">
              <Card className="transition-shadow group-hover:shadow-md">
                <CardHeader>
                  <CardTitle>Breakfast: {mealPlan.breakfast.title}</CardTitle>
                  <CardDescription>{mealPlan.breakfast.calories} calories</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{mealPlan.breakfast.description}</p>
                </CardContent>
              </Card>
            </Link>
            <Link href={`/recipes/${mealPlan.lunch.id}`} className="group block">
              <Card className="transition-shadow group-hover:shadow-md">
                <CardHeader>
                  <CardTitle>Lunch: {mealPlan.lunch.title}</CardTitle>
                  <CardDescription>{mealPlan.lunch.calories} calories</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{mealPlan.lunch.description}</p>
                </CardContent>
              </Card>
            </Link>
            <Link href={`/recipes/${mealPlan.dinner.id}`} className="group block">
              <Card className="transition-shadow group-hover:shadow-md">
                <CardHeader>
                  <CardTitle>Dinner: {mealPlan.dinner.title}</CardTitle>
                  <CardDescription>{mealPlan.dinner.calories} calories</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{mealPlan.dinner.description}</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        ) : (
          <Card className="flex h-full min-h-[400px] flex-col items-center justify-center text-center">
            <CardContent className="p-6">
                <Sparkles className="h-12 w-12 text-muted-foreground mx-auto" />
                <h4 className="mt-4 text-lg font-semibold">Your meal plan will appear here</h4>
                <p className="mt-1 text-muted-foreground">Fill out the form to get started.</p>
                {state.message && !state.mealPlan && <p className="mt-4 text-sm text-destructive">{state.message}</p>}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
