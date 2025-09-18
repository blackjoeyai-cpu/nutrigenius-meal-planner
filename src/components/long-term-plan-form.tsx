
'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  FormField,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CUISINES, DIETARY_PREFERENCES } from '@/lib/constants';
import type { Recipe, MealPlan } from '@/lib/types';
import {
  AlertTriangle,
  Loader2,
  PlusCircle,
  Sparkles,
  Save,
  XCircle,
} from 'lucide-react';
import { generatePlanAction, saveMealPlan } from '@/app/(app)/plans/actions';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { MultiSelect } from './ui/multi-select';
import { useIngredients } from '@/hooks/use-ingredients';
import { useRecipes } from '@/hooks/use-recipes';
import { AddRecipeDialog } from './add-recipe-dialog';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Skeleton } from './ui/skeleton';
import { useLanguageStore } from '@/hooks/use-language-store';
import { useAuth } from '@/hooks/use-auth';

const planFormSchema = z.object({
  numberOfDays: z.coerce
    .number()
    .min(1, 'Must be at least 1 day.')
    .max(30, 'Cannot generate for more than 30 days.'),
  dietaryPreferences: z.string({
    required_error: 'Please select a preference.',
  }),
  calorieTarget: z.coerce
    .number()
    .min(100, 'Calorie target must be at least 100.'),
  allergies: z.string(),
  cuisine: z.string({ required_error: 'Please select a cuisine.' }),
  generationSource: z.enum(['catalog', 'new', 'combined']),
  ingredients: z.array(z.string()),
});

type PlanFormValues = z.infer<typeof planFormSchema>;

type LongTermPlanFormProps = {
  recipes: Recipe[];
};

const initialState = {
  message: '',
  errors: null,
  isSuccess: false,
  mealPlan: null,
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

type ParsedPlan = Omit<MealPlan, 'id' | 'userId' | 'createdAt'> & {
  generationSource: string;
  language?: string;
};

export function LongTermPlanForm({ recipes }: LongTermPlanFormProps) {
  const { user } = useAuth();
  const [state, formAction, isPending] = useActionState(
    generatePlanAction,
    initialState
  );
  const { toast } = useToast();
  const { ingredients: allIngredients } = useIngredients();
  const { refreshRecipes } = useRecipes();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const { language } = useLanguageStore();

  const [generatedPlan, setGeneratedPlan] = useState<ParsedPlan | null>(null);

  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      numberOfDays: 7,
      dietaryPreferences: DIETARY_PREFERENCES[0],
      cuisine: CUISINES[0],
      calorieTarget: 2000,
      allergies: '',
      generationSource: 'catalog',
      ingredients: [],
    },
  });

  useEffect(() => {
    if (state.isSuccess && state.mealPlan) {
      setGeneratedPlan(JSON.parse(state.mealPlan));
    }
  }, [state.isSuccess, state.mealPlan]);

  const generationSource = form.watch('generationSource');
  const numberOfDays = form.watch('numberOfDays');
  const hasEnoughRecipesForCatalog = recipes.length > 3;
  const isCatalogGenerationBlocked =
    generationSource === 'catalog' && !hasEnoughRecipesForCatalog;

  const handleSave = async () => {
    if (!generatedPlan || !user) return;
    setIsSaving(true);
    const result = await saveMealPlan(generatedPlan, user.uid);
    setIsSaving(false);

    if (result.success) {
      toast({
        title: 'Success!',
        description: 'Your long-term meal plan has been generated and saved.',
      });
      router.push('/plans');
    } else {
      toast({
        title: 'Error',
        description: result.message,
        variant: 'destructive',
      });
    }
  };

  const handleDiscard = () => {
    setGeneratedPlan(null);
    state.mealPlan = null;
    state.message = '';
    state.errors = null;
    state.isSuccess = false;
  };

  useEffect(() => {
    if (state.message && state.errors) {
      const errorValues = Object.values(state.errors).flat();
      if (errorValues.length > 0) {
        toast({
          title: 'Error',
          description: errorValues.join(' '),
          variant: 'destructive',
        });
      }
    } else if (state.message && !state.isSuccess && !state.errors) {
      toast({
        title: 'Error',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, toast]);

  if (isPending) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Generating Your Plan...</CardTitle>
          <CardDescription>
            Please wait while the AI creates your custom meal plan for{' '}
            {numberOfDays} days.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: Math.min(numberOfDays, 3) }).map(
              (_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              )
            )}
            {numberOfDays > 3 && (
              <div className="text-center text-muted-foreground py-4">
                . . .
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (generatedPlan) {
    return (
      <Card className="mt-6 animate-in fade-in-0 slide-in-from-bottom-4">
        <CardHeader>
          <CardTitle>Review Your Long-Term Plan</CardTitle>
          <CardDescription>
            Here is the {generatedPlan.days.length}-day meal plan generated for
            you. Review the details below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Accordion type="single" collapsible className="w-full">
            {generatedPlan.days.map((day, index) => (
              <AccordionItem value={`day-${index}`} key={`day-${index}`}>
                <AccordionTrigger>Day {index + 1}</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pl-2">
                    {[day.breakfast, day.lunch, day.dinner].map(
                      (meal, mealIndex) => {
                        const isNewRecipe = meal.id.startsWith('new-recipe-');

                        return (
                          <>
                            {isNewRecipe ? (
                              <div className="group block">
                                <Card className="transition-shadow group-hover:shadow-md">
                                  <CardHeader>
                                    <CardTitle className="text-lg">
                                      {
                                        ['Breakfast', 'Lunch', 'Dinner'][
                                          mealIndex
                                        ]
                                      }
                                      : {meal.title}
                                    </CardTitle>
                                    <CardDescription>
                                      {meal.calories} calories
                                    </CardDescription>
                                  </CardHeader>
                                </Card>
                              </div>
                            ) : (
                              <Link
                                href={`/recipes/${meal.id}`}
                                className="group block"
                                key={mealIndex}
                              >
                                <Card className="transition-shadow group-hover:shadow-md">
                                  <CardHeader>
                                    <CardTitle className="text-lg">
                                      {
                                        ['Breakfast', 'Lunch', 'Dinner'][
                                          mealIndex
                                        ]
                                      }
                                      : {meal.title}
                                    </CardTitle>
                                    <CardDescription>
                                      {meal.calories} calories
                                    </CardDescription>
                                  </CardHeader>
                                </Card>
                              </Link>
                            )}
                          </>
                        );
                      }
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
        <CardFooter className="flex-col items-start gap-4">
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Plan
            </Button>
            <Button variant="outline" onClick={handleDiscard}>
              <XCircle className="mr-2 h-4 w-4" />
              Discard
            </Button>
          </div>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <Form {...form}>
        <form
          action={formAction}
          onSubmit={form.handleSubmit(() => {})}
          id="long-term-plan-form"
        >
          <CardHeader>
            <CardTitle>Generate a New Long-term Plan</CardTitle>
            <CardDescription>
              Specify the duration and your preferences for the new plan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <input
              type="hidden"
              name="recipes"
              value={JSON.stringify(recipes)}
            />
            <input type="hidden" name="language" value={language} />
            {user && <input type="hidden" name="userId" value={user.uid} />}
            <>
              {isCatalogGenerationBlocked ? (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Not Enough Recipes</AlertTitle>
                  <AlertDescription>
                    You need more than 3 recipes in your collection to generate
                    a plan from your catalog. Please add more recipes, or choose
                    a different generation source.
                  </AlertDescription>
                  <div className="mt-4">
                    <AddRecipeDialog
                      open={isAddDialogOpen}
                      onOpenChange={setIsAddDialogOpen}
                      onRecipeAdd={newRecipe => {
                        refreshRecipes();
                        setIsAddDialogOpen(false);
                      }}
                    >
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setIsAddDialogOpen(true)}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Recipe
                      </Button>
                    </AddRecipeDialog>
                  </div>
                </Alert>
              ) : null}
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
                        name={field.name}
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
                      <Input
                        type="number"
                        placeholder="e.g., 7"
                        {...field}
                        name={field.name}
                      />
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
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      name={field.name}
                    >
                      <FormControl>
                        <SelectTrigger ref={field.ref}>
                          <SelectValue placeholder="Select a preference" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DIETARY_PREFERENCES.map(pref => (
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
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      name={field.name}
                    >
                      <FormControl>
                        <SelectTrigger ref={field.ref}>
                          <SelectValue placeholder="Select a cuisine" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CUISINES.map(c => (
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
                      <Input
                        type="number"
                        placeholder="e.g., 2000"
                        {...field}
                        name={field.name}
                      />
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
                        options={allIngredients.map(i => ({
                          value: i,
                          label: i,
                        }))}
                        selected={field.value}
                        onChange={field.onChange}
                        placeholder="Select ingredients you have..."
                      />
                    </FormControl>
                    <FormMessage />
                    <input
                      type="hidden"
                      name={field.name}
                      value={field.value.join(',')}
                    />
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
                        name={field.name}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          </CardContent>
          <CardFooter>
            <SubmitButton disabled={isCatalogGenerationBlocked} />
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
