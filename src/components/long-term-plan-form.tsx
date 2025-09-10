
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useActionState, useEffect } from "react";
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CUISINES, DIETARY_PREFERENCES } from "@/lib/constants";
import type { Recipe } from "@/lib/types";
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

type LongTermPlanFormProps = {
  recipes: Recipe[];
};

const initialState = {
  message: "",
  errors: null,
  isSuccess: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
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
    if (state.isSuccess) {
      toast({
        title: "Success!",
        description: state.message,
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
            onSubmit={form.handleSubmit(() => {
                const formElement = document.querySelector('form');
                if (formElement) {
                    const formData = new FormData(formElement);
                    formAction(formData);
                }
            })}
          >
          <input type="hidden" name="recipes" value={JSON.stringify(recipes)} />
            <CardHeader>
                <CardTitle>Generate a New Long-term Plan</CardTitle>
                <CardDescription>
                    Specify the duration and your preferences for the new plan.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
            </CardContent>
            <CardFooter>
              <SubmitButton />
            </CardFooter>
          </form>
        </Form>
    </Card>
  );
}
