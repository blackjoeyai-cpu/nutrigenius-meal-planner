
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
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
import { ScrollArea } from "./ui/scroll-area";
import { useState, useEffect } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { generatePlanAction } from "@/app/(app)/plans/actions";
import { useToast } from "@/hooks/use-toast";

const planFormSchema = z.object({
  numberOfDays: z.coerce.number().min(1, "Must be at least 1 day.").max(30, "Cannot generate for more than 30 days."),
  dietaryPreferences: z.string({ required_error: "Please select a preference." }),
  calorieTarget: z.coerce.number().min(100, "Calorie target must be at least 100."),
  allergies: z.string(),
  cuisine: z.string({ required_error: "Please select a cuisine." }),
});

type PlanFormValues = z.infer<typeof planFormSchema>;

type GeneratePlanDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPlanGenerated: () => void;
  recipes: Recipe[];
  children: React.ReactNode;
};

const initialState = {
  message: "",
  errors: null,
  plan: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
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


export function GeneratePlanDialog({ open, onOpenChange, onPlanGenerated, recipes, children }: GeneratePlanDialogProps) {
  const [state, formAction] = useActionState(generatePlanAction, initialState);
  const { toast } = useToast();

  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      numberOfDays: 7,
      dietaryPreferences: DIETARY_PREFERENCES[0],
      cuisine: CUISINES[0],
      calorieTarget: 2000,
      allergies: "",
    },
  });

  useEffect(() => {
    if (state.message && !state.errors) {
      toast({
        title: "Success!",
        description: state.message,
      });
      onPlanGenerated();
      form.reset();
    } else if (state.message && state.errors) {
        // Find the specific error for numberOfDays if it exists
        const dayError = state.errors.numberOfDays?.[0] ?? state.message;
        toast({
            title: "Error",
            description: dayError,
            variant: "destructive",
        })
    }
  }, [state, toast, onPlanGenerated, form]);


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Generate a New Meal Plan</DialogTitle>
          <DialogDescription>
            Specify the duration and your preferences for the new plan.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={(evt) => {
              evt.preventDefault();
              const formData = new FormData(evt.currentTarget);
              form.handleSubmit(() => {
                  formAction(formData)
              })(evt);
            }}
            className="space-y-4"
          >
             <input type="hidden" name="recipes" value={JSON.stringify(recipes)} />
            <ScrollArea className="h-[55vh] p-1">
              <div className="space-y-6 p-4">
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
              </div>
            </ScrollArea>
            <DialogFooter className="pt-4 pr-4">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <SubmitButton />
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
