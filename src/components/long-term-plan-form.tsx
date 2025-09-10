
"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormItem, FormLabel, FormMessage, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CUISINES, DIETARY_PREFERENCES } from "@/lib/constants";
import type { Recipe } from "@/lib/types";
import { AlertTriangle, Loader2, PlusCircle, Sparkles } from "lucide-react";
import { generatePlanAction } from "@/app/(app)/plans/actions";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { MultiSelect } from "./ui/multi-select";
import { useIngredients } from "@/hooks/use-ingredients";
import { useRecipes } from "@/hooks/use-recipes";
import { AddRecipeDialog } from "./add-recipe-dialog";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";


const planFormSchema = z.object({
  numberOfDays: z.coerce.number().min(1, "Must be at least 1 day.").max(30, "Cannot generate for more than 30 days."),
  dietaryPreferences: z.string({ required_error: "Please select a preference." }),
  calorieTarget: z.coerce.number().min(100, "Calorie target must be at least 100."),
  allergies: z.string(),
  cuisine: z.string({ required_error: "Please select a cuisine." }),
  generationSource: z.enum(["catalog", "new", "combined"]),
  ingredients: z.array(z.string()),
});

type PlanFormValues = z.infer<typeof planFormSchema>;

type LongTermPlanFormProps = {
  recipes: Recipe[];
};

const initialState = {
  message: "",
  errors: null,
  isSuccess: false,
};

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate Plan
        </>
      )}
    </Button>
  );
}

export function LongTermPlanForm({ recipes }: LongTermPlanFormProps) {
  const [state, formAction] = useActionState(generatePlanAction, initialState);
  const { toast } = useToast();
  const router = useRouter();
  const { ingredients: allIngredients } = useIngredients();
  const { addRecipe } = useRecipes();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      numberOfDays: 7,
      dietaryPreferences: DIETARY_PREFERENCES[0],
      cuisine: CUISINES[0],
      calorieTarget: 2000,
      allergies: "",
      generationSource: "catalog",
      ingredients: [],
    },
  });

  const generationSource = form.watch("generationSource");
  const hasEnoughRecipesForCatalog = recipes.length > 3;
  const isCatalogGenerationBlocked = generationSource === 'catalog' && !hasEnoughRecipesForCatalog;


  useEffect(() => {
    if (state.isSuccess) {
      toast({
        title: "Success!",
        description: "Your long-term meal plan has been generated and saved.",
      });
      router.push('/plans');
    } else if (state.message && state.errors) {
        const dayError = state.errors.numberOfDays?.[0] ?? state.message;
        toast({
            title: "Error",
            description: dayError,
            variant: "destructive",
        })
    } else if (state.message && !state.isSuccess && !state.errors) {
         toast({
            title: "Error",
            description: state.message,
            variant: "destructive",
        })
    }
  }, [state, toast, router]);


  return (
    <Card className="mt-6">
        <Form {...form}>
          <form
            action={formAction}
          >
          <input type="hidden" name="recipes" value={JSON.stringify(recipes)} />
          <input type="hidden" name="ingredients" value={form.getValues("ingredients").join(",")} />
            <CardHeader>
                <CardTitle>Generate a New Long-term Plan</CardTitle>
                <CardDescription>
                    Specify the duration and your preferences for the new plan.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {isCatalogGenerationBlocked && (
                     <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Not Enough Recipes</AlertTitle>
                        <AlertDescription>
                            You need more than 3 recipes in your collection to generate a plan from your catalog. 
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
                 <FormField
                    control={form.control}
                    name="generationSource"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                        <FormLabel>Generation Source</FormLabel>
                        <FormControl>
                            <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                            >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="catalog" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                Use my existing recipes
                                </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="new" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                Generate all new recipes
                                </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="combined" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                Combine existing and new recipes
                                </FormLabel>
                            </FormItem>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />

                 <FormField
                  control={form.control}
                  name="numberOfDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Days</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 7" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dietaryPreferences"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dietary Preferences</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a preference" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DIETARY_PREFERENCES.map((pref) => (
                            <SelectItem key={pref} value={pref}>
                              {pref}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cuisine"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cuisine</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a cuisine" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CUISINES.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="calorieTarget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily Calorie Target</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 2000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                    control={form.control}
                    name="ingredients"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Ingredients on Hand</FormLabel>
                        <FormControl>
                             <MultiSelect
                                options={allIngredients.map(i => ({ value: i, label: i }))}
                                selected={field.value}
                                onChange={field.onChange}
                                className="w-full"
                                placeholder="Select ingredients you have..."
                            />
                        </FormControl>
                         <FormMessage />
                        </FormItem>
                    )}
                    />


                <FormField
                  control={form.control}
                  name="allergies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Allergies or Restrictions</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., peanuts, shellfish, dairy. Separate with commas."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </CardContent>
            <CardFooter>
              <SubmitButton disabled={isCatalogGenerationBlocked} />
            </CardFooter>
          </form>
        </Form>
    </Card>
  );
}
