"use client";

import { useState, useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createMealPlan } from "./actions";
import { useUserProfile } from "@/hooks/use-user-profile";
import { DIETARY_PREFERENCES } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";

const initialState = {
  message: "",
  errors: null,
  mealPlan: null,
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
          Generate Meal Plan
        </>
      )}
    </Button>
  );
}

export default function GeneratePage() {
  const [state, formAction] = useFormState(createMealPlan, initialState);
  const { profile, isLoaded } = useUserProfile();

  const [dietaryPreferences, setDietaryPreferences] = useState(profile.dietaryPreferences);
  const [calorieTarget, setCalorieTarget] = useState(profile.calorieTarget.toString());
  const [allergies, setAllergies] = useState(profile.allergies);

  useEffect(() => {
    if (isLoaded) {
      setDietaryPreferences(profile.dietaryPreferences);
      setCalorieTarget(profile.calorieTarget.toString());
      setAllergies(profile.allergies);
    }
  }, [isLoaded, profile]);

  if (!isLoaded) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-40" />
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <Card>
        <form action={formAction}>
          <CardHeader>
            <CardTitle>Create Your Meal Plan</CardTitle>
            <CardDescription>
              Provide your details and let our AI create a personalized meal plan for you.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>

      <div className="space-y-4">
        <h3 className="text-2xl font-bold font-headline">Your Generated Plan</h3>
        <Card className="min-h-[400px]">
            <CardContent className="p-6">
            {state.mealPlan ? (
              <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                {state.mealPlan}
              </div>
            ) : (
              <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center">
                <Sparkles className="h-12 w-12 text-muted-foreground" />
                <h4 className="mt-4 text-lg font-semibold">Your meal plan will appear here</h4>
                <p className="mt-1 text-muted-foreground">Fill out the form to get started.</p>
                {state.message && !state.mealPlan && <p className="mt-4 text-sm text-destructive">{state.message}</p>}
              </div>
            )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
