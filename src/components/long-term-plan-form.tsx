
"use client";

import { useActionState, useEffect, useState, Fragment } from "react";
import { useFormStatus } from "react-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  FormField,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CUISINES, DIETARY_PREFERENCES } from "@/lib/constants";
import type { Recipe, MealPlan } from "@/lib/types";
import {
  AlertTriangle,
  Loader2,
  PlusCircle,
  Sparkles,
  Save,
  XCircle,
} from "lucide-react";
import { generatePlanAction, saveMealPlan } from "@/app/[locale]/plans/actions";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Link, useRouter } from "next-intl/client";
import { Skeleton } from "./ui/skeleton";
import { useTranslations } from "next-intl";

const planFormSchema = z.object({
  numberOfDays: z.coerce
    .number()
    .min(1, "Must be at least 1 day.")
    .max(30, "Cannot generate for more than 30 days."),
  dietaryPreferences: z.string({
    required_error: "Please select a preference.",
  }),
  calorieTarget: z.coerce
    .number()
    .min(100, "Calorie target must be at least 100."),
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
  mealPlan: null,
};

function SubmitButton({
  disabled,
  text,
}: {
  disabled?: boolean;
  text: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {text}...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          {text}
        </>
      )}
    </Button>
  );
}

type ParsedPlan = Omit<MealPlan, "id" | "userId" | "createdAt"> & {
  generationSource: string;
};

export function LongTermPlanForm({ recipes }: LongTermPlanFormProps) {
  const [state, formAction, isPending] = useActionState(
    generatePlanAction,
    initialState,
  );
  const { toast } = useToast();
  const { ingredients: allIngredients } = useIngredients();
  const { addRecipe } = useRecipes();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const t = useTranslations("LongTermPlanForm");

  const [generatedPlan, setGeneratedPlan] = useState<ParsedPlan | null>(null);

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

  useEffect(() => {
    if (state.isSuccess && state.mealPlan) {
      setGeneratedPlan(JSON.parse(state.mealPlan));
    }
  }, [state.isSuccess, state.mealPlan]);

  const generationSource = form.watch("generationSource");
  const numberOfDays = form.watch("numberOfDays");
  const hasEnoughRecipesForCatalog = recipes.length > 3;
  const isCatalogGenerationBlocked =
    generationSource === "catalog" && !hasEnoughRecipesForCatalog;

  const handleSave = async () => {
    if (!generatedPlan) return;
    setIsSaving(true);
    const result = await saveMealPlan(generatedPlan);
    setIsSaving(false);

    if (result.success) {
      toast({
        title: t("success"),
        description: t("success_long_term_plan_saved"),
      });
      router.push("/plans");
    } else {
      toast({
        title: t("error"),
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
    state.isSuccess = false;
  };

  useEffect(() => {
    if (state.message && state.errors) {
      const errorValues = Object.values(state.errors).flat();
      if (errorValues.length > 0) {
        toast({
          title: t("error"),
          description: errorValues.join(" "),
          variant: "destructive",
        });
      }
    } else if (state.message && !state.isSuccess && !state.errors) {
      toast({
        title: t("error"),
        description: state.message,
        variant: "destructive",
      });
    }
  }, [state, toast, t]);

  if (isPending) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t("generating_your_plan")}</CardTitle>
          <CardDescription>
            {t("generating_your_plan_desc", { count: numberOfDays })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: Math.min(numberOfDays, 3) }).map(
              (_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ),
            )}
            {numberOfDays > 3 && (
              <div className="py-4 text-center text-muted-foreground">
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
      <Card className="animate-in fade-in-0 slide-in-from-bottom-4 mt-6">
        <CardHeader>
          <CardTitle>{t("review_long_term_plan")}</CardTitle>
          <CardDescription>
            {t("review_long_term_plan_desc", {
              count: generatedPlan.days.length,
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Accordion type="single" collapsible className="w-full">
            {generatedPlan.days.map((day, index) => (
              <AccordionItem value={`day-${index}`} key={`day-${index}`}>
                <AccordionTrigger>
                  {t("day")} {index + 1}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pl-2">
                    {[day.breakfast, day.lunch, day.dinner].map(
                      (meal, mealIndex) => {
                        const mealType = ["breakfast", "lunch", "dinner"][
                          mealIndex
                        ] as "breakfast" | "lunch" | "dinner";
                        const isNewRecipe = meal.id.startsWith("new-recipe-");
                        const Wrapper = isNewRecipe ? "div" : Link;
                        const props = isNewRecipe
                          ? {}
                          : { href: `/recipes/${meal.id}` };

                        return (
                          <Wrapper
                            key={mealIndex}
                            {...props}
                            className={`group block ${
                              isNewRecipe ? "cursor-default" : ""
                            }`}
                          >
                            <Card className="transition-shadow group-hover:shadow-md">
                              <CardHeader>
                                <CardTitle className="text-lg">
                                  {t(mealType)}: {meal.title}
                                </CardTitle>
                                <CardDescription>
                                  {meal.calories} {t("calories_short")}
                                </CardDescription>
                              </CardHeader>
                            </Card>
                          </Wrapper>
                        );
                      },
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
              {t("save_plan")}
            </Button>
            <Button variant="outline" onClick={handleDiscard}>
              <XCircle className="mr-2 h-4 w-4" />
              {t("discard")}
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
          action={() => {
            const combinedData = new FormData();
            const formValues = form.getValues();

            (Object.keys(formValues) as Array<keyof PlanFormValues>).forEach(
              (key) => {
                const value = formValues[key];
                if (key === "ingredients" && Array.isArray(value)) {
                  combinedData.append(key, value.join(","));
                } else if (value !== undefined) {
                  combinedData.append(key, String(value));
                }
              },
            );

            combinedData.append("recipes", JSON.stringify(recipes));

            form.handleSubmit(() => formAction(combinedData))();
          }}
        >
          <CardHeader>
            <CardTitle>{t("generate_long_term_plan")}</CardTitle>
            <CardDescription>{t("generate_long_term_plan_desc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <>
              {isCatalogGenerationBlocked ? (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>{t("not_enough_recipes")}</AlertTitle>
                  <AlertDescription>
                    {t("not_enough_recipes_desc_long_term")}
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
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setIsAddDialogOpen(true)}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        {t("add_recipe")}
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
                    <FormLabel>{t("generation_source")}</FormLabel>
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
                            {t("source_catalog")}
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="new" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {t("source_new")}
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="combined" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {t("source_combined")}
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
                    <FormLabel>{t("number_of_days")}</FormLabel>
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
                    <FormLabel>{t("dietary_preferences")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      name={field.name}
                    >
                      <FormControl>
                        <SelectTrigger ref={field.ref}>
                          <SelectValue placeholder={t("select_preference")} />
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
                    <FormLabel>{t("cuisine")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      name={field.name}
                    >
                      <FormControl>
                        <SelectTrigger ref={field.ref}>
                          <SelectValue placeholder={t("select_cuisine")} />
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
                    <FormLabel>{t("calorie_target")}</FormLabel>
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
                    <FormLabel>{t("ingredients_on_hand")}</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={allIngredients.map((i) => ({
                          value: i,
                          label: i,
                        }))}
                        selected={field.value}
                        onChange={field.onChange}
                        placeholder={t("select_ingredients")}
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
                    <FormLabel>{t("allergies")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("allergies_placeholder_long")}
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
            <SubmitButton
              disabled={isCatalogGenerationBlocked}
              text={t("generate_plan")}
            />
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
