
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CUISINES, DIETARY_PREFERENCES } from "@/lib/constants";
import type { Recipe } from "@/lib/types";
import { MultiSelect } from "./ui/multi-select";
import { ScrollArea } from "./ui/scroll-area";


const recipeFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  cuisine: z.string({ required_error: "Please select a cuisine." }),
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
  onRecipeAdd: (recipe: Omit<Recipe, 'id' | 'imageId'>) => void;
  children: React.ReactNode;
};

export function AddRecipeDialog({ open, onOpenChange, onRecipeAdd, children }: AddRecipeDialogProps) {
  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: {
      name: "",
      cuisine: "Any",
      dietaryTags: [],
      ingredients: "",
      instructions: "",
      prepTime: 0,
      cookTime: 0,
      servings: 1,
      nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    },
  });

  function onSubmit(data: RecipeFormValues) {
    const ingredientsArray = data.ingredients.split('\n').map(line => {
      const [quantity, ...itemParts] = line.split(' ');
      return { quantity, item: itemParts.join(' ') };
    });

    const newRecipe = {
      ...data,
      ingredients: ingredientsArray,
      instructions: data.instructions.split('\n'),
    };
    onRecipeAdd(newRecipe);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        {children}
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add a New Recipe</DialogTitle>
          <DialogDescription>
            Fill out the form below to add your own recipe to the collection.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className="h-[60vh] p-4">
            <div className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipe Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Spicy Chicken Curry" {...field} />
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
                      <FormLabel>Cuisine</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  name="dietaryTags"
                  render={({ field }) => (
                    <FormItem>
                        <FormLabel>Dietary Tags</FormLabel>
                        <FormControl>
                            <MultiSelect
                                options={DIETARY_PREFERENCES.map(p => ({value: p, label: p}))}
                                selected={field.value}
                                onChange={field.onChange}
                                placeholder="Select tags..."
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="ingredients"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ingredients</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter each ingredient on a new line, e.g., '1 cup flour'"
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
                    <FormLabel>Instructions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter each step on a new line."
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
                      <FormLabel>Prep Time (min)</FormLabel>
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
                      <FormLabel>Cook Time (min)</FormLabel>
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
                      <FormLabel>Servings</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                       <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

               <div>
                 <h4 className="mb-4 font-medium">Nutritional Information (per serving)</h4>
                 <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <FormField
                    control={form.control}
                    name="nutrition.calories"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Calories</FormLabel>
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
                        <FormLabel>Protein (g)</FormLabel>
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
                        <FormLabel>Carbs (g)</FormLabel>
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
                        <FormLabel>Fat (g)</FormLabel>
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
                <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="submit">Add Recipe</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
