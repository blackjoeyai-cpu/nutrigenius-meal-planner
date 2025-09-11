
"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from 'next/link';
import { Sparkles, Loader2, Flame, AlertTriangle, PlusCircle, Save, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createMealPlan, saveDailyPlan, regenerateMealAction } from "@/app/(app)/generate/actions";
import { DIETARY_PREFERENCES, CUISINES } from "@/lib/constants";
import { MultiSelect } from "@/components/ui/multi-select";
import { useIngredients } from "@/hooks/use-ingredients";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AddRecipeDialog } from "@/components/add-recipe-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { Recipe, MealPlan, DailyPlan } from "@/lib/types";
import { useRecipes } from "@/hooks/use-recipes";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { Skeleton } from "./ui/skeleton";


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

type ParsedPlan = Omit<MealPlan, "id" | "userId" | "createdAt"> & {
  generationSource: string;
}

type MealType = "breakfast" | "lunch" | "dinner";

export function DailyPlanForm({ recipes }: { recipes: Recipe[] }) {
  const [state, formAction, isPending] = useActionState(createMealPlan, initialState);
  const { ingredients } = useIngredients();
  const { addRecipe } = useRecipes();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Local state to hold the generated plan
  const [generatedPlan, setGeneratedPlan] = useState<ParsedPlan | null>(null);

  // Default values
  const [dietaryPreferences, setDietaryPreferences] = useState(searchParams.get("dietaryPreferences") || DIETARY_PREFERENCES[0]);
  const [calorieTarget, setCalorieTarget] = useState(searchParams.get("calorieTarget") || "2000");
  const [allergies, setAllergies] = useState(searchParams.get("allergies") || "");
  const [cuisine, setCuisine] = useState(searchParams.get("cuisine") || CUISINES[0]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [generationSource, setGenerationSource] = useState("catalog");
  const [isSaving, setIsSaving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState<MealType | null>(null);

  const planId = searchParams.get("planId");
  const date = searchParams.get("date");


  useEffect(() => {
    if (state.mealPlan) {
        setGeneratedPlan(JSON.parse(state.mealPlan));
    }
  }, [state.mealPlan]);


  const hasEnoughRecipesForCatalog = recipes.length > 3;
  const isCatalogGenerationBlocked = generationSource === 'catalog' && !hasEnoughRecipesForCatalog;

  const totalCalories = generatedPlan ? generatedPlan.days[0].breakfast.calories + generatedPlan.days[0].lunch.calories + generatedPlan.days[0].dinner.calories : 0;

  const handleSave = async () => {
    if (!generatedPlan) return;
    setIsSaving(true);
    
    const planToSave = {
        ...generatedPlan,
        planId: planId || undefined,
        date: date || undefined,
    }

    const result = await saveDailyPlan(planToSave);
    setIsSaving(false);
    if (result.success) {
      toast({
        title: "Success!",
        description: `Your meal plan has been ${planId ? 'updated' : 'saved'}.`,
      });
      router.push("/plans");
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  const handleDiscard = () => {
     setGeneratedPlan(null);
     state.mealPlan = null;
     state.message = "";
     state.errors = null;
  }

  const handleRegenerateMeal = async (mealType: MealType) => {
    if (!generatedPlan) return;

    setIsRegenerating(mealType);

    const currentMeals: Partial<DailyPlan> = { ...generatedPlan.days[0] };
    delete currentMeals[mealType];

    const input = {
      dietaryPreferences,
      calorieTarget: parseInt(calorieTarget),
      allergies: allergies || "none",
      cuisine,
      ingredients: selectedIngredients.join(','),
      availableRecipes: JSON.stringify(recipes),
      generationSource: generationSource as "catalog" | "new" | "combined",
      mealToRegenerate: mealType,
      currentMeals,
    };

    const result = await regenerateMealAction(input);

    if (result.success && result.meal) {
      const newPlan = { ...generatedPlan };
      newPlan.days[0][mealType] = result.meal;
      setGeneratedPlan(newPlan);
      toast({
        title: "Meal Regenerated!",
        description: `Your ${mealType} has been updated.`,
      });
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to regenerate meal.",
        variant: "destructive",
      });
    }

    setIsRegenerating(null);
  };

  const MealCard = ({ mealType, meal }: { mealType: MealType; meal: DailyPlan[MealType] }) => (
    <Card className="transition-shadow group-hover:shadow-md relative">
       <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:bg-accent"
            onClick={() => handleRegenerateMeal(mealType)}
            disabled={isRegenerating !== null}
        >
            {isRegenerating === mealType ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <RefreshCw className="h-4 w-4" />
            )}
        </Button>
      <Link href={`/recipes/${meal.id}`} className="group block">
        <CardHeader>
          <CardTitle>{mealType.charAt(0).toUpperCase() + mealType.slice(1)}: {meal.title}</CardTitle>
          <CardDescription>{meal.calories} calories</CardDescription>
        </CardHeader>
        <CardContent>
          <p>{meal.description}</p>
        </CardContent>
      </Link>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 pt-6">
      <Card>
        <form action={formAction}>
           <input type="hidden" name="ingredients" value={selectedIngredients.join(',')} />
           <input type="hidden" name="recipes" value={JSON.stringify(recipes)} />
          <CardHeader>
            <CardTitle>{planId ? 'Regenerate' : 'Create'} Your Daily Meal Plan</CardTitle>
            <CardDescription>
              {planId ? 'Adjust preferences and generate an updated plan for this day.' : 'Provide your details and let our AI create a personalized meal plan for you.'}
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
            {generatedPlan && !isPending && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Flame className="h-4 w-4" />
                    <span>Total Calories: {totalCalories}</span>
                </div>
            )}
        </div>

        {isPending ? (
            <div className="space-y-4">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-3/5" />
                        <Skeleton className="h-4 w-1/4" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5 mt-2" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-3/5" />
                        <Skeleton className="h-4 w-1/4" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5 mt-2" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-3/5" />
                        <Skeleton className="h-4 w-1/4" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5 mt-2" />
                    </CardContent>
                </Card>
            </div>
        ) : generatedPlan ? (
          <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-4">
            <MealCard mealType="breakfast" meal={generatedPlan.days[0].breakfast} />
            <MealCard mealType="lunch" meal={generatedPlan.days[0].lunch} />
            <MealCard mealType="dinner" meal={generatedPlan.days[0].dinner} />
             <Card>
                <CardHeader>
                    <CardTitle>Happy with this plan?</CardTitle>
                    <CardDescription>Save it to your calendar or discard it and generate a new one.</CardDescription>
                </CardHeader>
                <CardFooter className="flex gap-4">
                     <Button onClick={handleSave} disabled={isSaving || generatedPlan.generationSource !== 'catalog'}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Plan
                    </Button>
                    <Button variant="outline" onClick={handleDiscard}>
                        <XCircle className="mr-2 h-4 w-4" />
                        Discard
                    </Button>
                </CardFooter>
                 {generatedPlan.generationSource !== 'catalog' && <CardContent><Alert variant="destructive" className="mt-4"><AlertTriangle className="h-4 w-4" /><AlertDescription>Saving is disabled unless "Use my existing recipes" is selected. This ensures all saved recipes have valid links.</AlertDescription></Alert></CardContent>}
            </Card>
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