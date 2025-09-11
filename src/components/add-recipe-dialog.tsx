"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CUISINES, DIETARY_PREFERENCES, MEAL_TYPES } from "@/lib/constants";
import type { Recipe } from "@/lib/types";
import { MultiSelect } from "./ui/multi-select";
import { ScrollArea } from "./ui/scroll-area";
import { useState, useEffect } from "react";
import {
  generateRecipeAction,
  updateRecipeAction,
} from "@/app/[locale]/recipes/actions";
import { Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslations, useLocale } from "next-intl";

const recipeFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  cuisine: z.string({ required_error: "Please select a cuisine." }),
  mealTypes: z.array(z.string()).min(1, "Select at least one meal type."),
  dietaryTags: z.array(z.string()).min(1, "Select at least one dietary tag."),
  ingredients: z.string().min(1, "Please list ingredients."),
  instructions: z.string().min(1, "Please provide instructions."),
  prepTime: z.coerce.number().min(0),
  cookTime: z.coerce.number().min(0),
  servings: z.coerce.number().min(1),
  nutrition: z.object({
    calories: z.coerce.number().min(0),
    protein: z.coerce.number().min(0),
    carbs: z.coerce.number().min(0),
    fat: z.coerce.number().min(0),
  }),
});

type RecipeFormValues = z.infer<typeof recipeFormSchema>;

type AddRecipeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRecipeAdd: (recipe: Omit<Recipe, "id" | "imageId"> | Recipe) => void;
  children: React.ReactNode;
  recipeToEdit?: Recipe;
};

export function AddRecipeDialog({
  open,
  onOpenChange,
  onRecipeAdd,
  children,
  recipeToEdit,
}: AddRecipeDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPrompt, setGenerationPrompt] = useState("");
  const { toast } = useToast();
  const t = useTranslations("AddRecipeDialog");
  const locale = useLocale();
  const isEditMode = !!recipeToEdit;

  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: {
      name: "",
      cuisine: "Any",
      mealTypes: [],
      dietaryTags: [],
      ingredients: "",
      instructions: "",
      prepTime: 0,
      cookTime: 0,
      servings: 1,
      nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    },
  });

  useEffect(() => {
    if (recipeToEdit && open) {
      form.reset({
        name: recipeToEdit.name,
        cuisine: recipeToEdit.cuisine,
        mealTypes: recipeToEdit.mealTypes,
        dietaryTags: recipeToEdit.dietaryTags,
        ingredients: recipeToEdit.ingredients
          .map((i) => `${i.quantity} ${i.item}`)
          .join("\n"),
        instructions: recipeToEdit.instructions.join("\n"),
        prepTime: recipeToEdit.prepTime,
        cookTime: recipeToEdit.cookTime,
        servings: recipeToEdit.servings,
        nutrition: {
          calories: recipeToEdit.nutrition.calories,
          protein: recipeToEdit.nutrition.protein,
          carbs: recipeToEdit.nutrition.carbs,
          fat: recipeToEdit.nutrition.fat,
        },
      });
    } else if (!open) {
      form.reset();
      setGenerationPrompt("");
    }
  }, [recipeToEdit, open, form]);

  async function handleGenerateRecipe() {
    if (!generationPrompt) return;
    setIsGenerating(true);
    try {
      const result = await generateRecipeAction({
        prompt: generationPrompt,
        language: locale === "ms" ? "Malay" : undefined,
      });
      if (result) {
        form.reset({
          name: result.name,
          cuisine: result.cuisine,
          mealTypes: result.mealTypes,
          dietaryTags: result.dietaryTags,
          ingredients: result.ingredients
            .map((i) => `${i.quantity} ${i.item}`)
            .join("\n"),
          instructions: result.instructions.join("\n"),
          prepTime: result.prepTime,
          cookTime: result.cookTime,
          servings: result.servings,
          nutrition: {
            calories: result.nutrition.calories,
            protein: result.nutrition.protein,
            carbs: result.nutrition.carbs,
            fat: result.nutrition.fat,
          },
        });
      }
    } catch (error) {
      console.error("Failed to generate recipe:", error);
      toast({
        title: t("error"),
        description: t("error_generating_recipe"),
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }

  async function onSubmit(data: RecipeFormValues) {
    const ingredientsArray = data.ingredients.split("\n").map((line) => {
      const parts = line.match(/^([^\s]+\s*[^s]*)\s+(.*)$/)?.slice(1) || [
        "",
        line,
      ];
      return { quantity: parts[0].trim() || "", item: parts[1].trim() };
    });

    const recipeData = {
      ...data,
      ingredients: ingredientsArray,
      instructions: data.instructions.split("\n"),
    };

    if (isEditMode && recipeToEdit) {
      try {
        await updateRecipeAction(recipeToEdit.id, recipeData);
        toast({
          title: t("success"),
          description: t("success_recipe_updated"),
        });
        onRecipeAdd(recipeData);
      } catch {
        toast({
          title: t("error"),
          description: t("error_updating_recipe"),
          variant: "destructive",
        });
      }
    } else {
      onRecipeAdd(recipeData);
    }
    form.reset();
    setGenerationPrompt("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? t("edit_recipe") : t("add_new_recipe")}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? t("edit_recipe_description")
              : t("add_new_recipe_description")}
          </DialogDescription>
        </DialogHeader>

        {!isEditMode && (
          <div className="space-y-4 rounded-md border p-4">
            <div className="space-y-2">
              <Label htmlFor="generation-prompt">{t("generate_with_ai")}</Label>
              <Textarea
                id="generation-prompt"
                placeholder={t("generate_with_ai_placeholder")}
                value={generationPrompt}
                onChange={(e) => setGenerationPrompt(e.target.value)}
              />
            </div>
            <Button
              onClick={handleGenerateRecipe}
              disabled={isGenerating || !generationPrompt}
              className="w-full sm:w-auto"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("generating")}...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {t("generate_recipe")}
                </>
              )}
            </Button>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className="h-[45vh] p-4">
              <div className="space-y-8">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("recipe_name")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("recipe_name_placeholder")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="cuisine"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("cuisine")}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
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
                    name="dietaryTags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("dietary_tags")}</FormLabel>
                        <FormControl>
                          <MultiSelect
                            options={DIETARY_PREFERENCES.map((p) => ({
                              value: p,
                              label: p,
                            }))}
                            selected={field.value}
                            onChange={field.onChange}
                            placeholder={t("select_tags")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="mealTypes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("meal_types")}</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={MEAL_TYPES.map((p) => ({
                            value: p,
                            label: p,
                          }))}
                          selected={field.value}
                          onChange={field.onChange}
                          placeholder={t("select_meal_types")}
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
                      <FormLabel>{t("ingredients")}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t("ingredients_placeholder")}
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="instructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("instructions")}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t("instructions_placeholder")}
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="prepTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("prep_time")}</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cookTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("cook_time")}</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="servings"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("servings")}</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <h4 className="mb-4 font-medium">
                    {t("nutritional_information")}
                  </h4>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <FormField
                      control={form.control}
                      name="nutrition.calories"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("calories")}</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="nutrition.protein"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("protein")}</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="nutrition.carbs"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("carbs")}</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="nutrition.fat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("fat")}</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                {t("cancel")}
              </Button>
              <Button type="submit">
                {isEditMode ? t("update_recipe") : t("add_recipe")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
