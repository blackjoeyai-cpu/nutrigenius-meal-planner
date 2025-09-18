'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  CalendarDays,
  ChefHat,
  Flame,
  PlusCircle,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getMealPlans } from '@/services/meal-plan-service';
import type { MealPlan } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useRecipes } from '@/hooks/use-recipes';
import { useAuth } from '@/hooks/use-auth';

export default function DashboardPage() {
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [todayPlan, setTodayPlan] = useState<MealPlan | null>(null);
  const router = useRouter();
  const { recipes, isLoaded: recipesLoaded } = useRecipes();
  const { user } = useAuth();

  useEffect(() => {
    async function fetchPlans() {
      if (!user) return;
      try {
        const fetchedPlans = await getMealPlans(user.uid);
        setPlans(fetchedPlans);

        // Find today's plan
        const today = new Date();
        const todayKey = format(today, 'yyyy-MM-dd');
        const todayPlanData = fetchedPlans.find(plan => {
          const planDate = new Date(plan.createdAt);
          return format(planDate, 'yyyy-MM-dd') === todayKey;
        });

        setTodayPlan(todayPlanData || null);
        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to fetch meal plans:', error);
        setIsLoaded(true);
      }
    }

    fetchPlans();
  }, [user]);

  const handleGeneratePlan = () => {
    router.push('/generate');
  };

  const handleViewPlans = () => {
    router.push('/plans');
  };

  const handleViewRecipes = () => {
    router.push('/recipes');
  };

  const totalRecipes = recipesLoaded ? recipes.length : 0;
  const totalPlans = isLoaded ? plans.length : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">
            Welcome back, {user?.displayName?.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground">
            {isLoaded
              ? `You have ${totalPlans} meal plans and ${totalRecipes} recipes`
              : 'Loading your dashboard...'}
          </p>
        </div>
        <Button onClick={handleGeneratePlan}>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recipes</CardTitle>
            <ChefHat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {recipesLoaded ? (
              <div className="text-2xl font-bold">{totalRecipes}</div>
            ) : (
              <Skeleton className="h-6 w-8" />
            )}
            <p className="text-xs text-muted-foreground">In your collection</p>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meal Plans</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoaded ? (
              <div className="text-2xl font-bold">{totalPlans}</div>
            ) : (
              <Skeleton className="h-6 w-8" />
            )}
            <p className="text-xs text-muted-foreground">Created so far</p>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today&apos;s Calories
            </CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoaded && todayPlan ? (
              <div className="text-2xl font-bold">
                {todayPlan.days[0].breakfast.calories +
                  todayPlan.days[0].lunch.calories +
                  todayPlan.days[0].dinner.calories}
              </div>
            ) : isLoaded ? (
              <div className="text-2xl font-bold">0</div>
            ) : (
              <Skeleton className="h-6 w-8" />
            )}
            <p className="text-xs text-muted-foreground">
              Target: {todayPlan?.calorieTarget || 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">Weekly goal</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Meal Plan</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoaded ? (
              todayPlan ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 rounded-lg border p-4">
                    <div className="rounded-full bg-primary/10 p-3">
                      <ChefHat className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Breakfast</h3>
                      <p className="text-sm text-muted-foreground">
                        {todayPlan.days[0].breakfast.title}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 rounded-lg border p-4">
                    <div className="rounded-full bg-primary/10 p-3">
                      <ChefHat className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Lunch</h3>
                      <p className="text-sm text-muted-foreground">
                        {todayPlan.days[0].lunch.title}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 rounded-lg border p-4">
                    <div className="rounded-full bg-primary/10 p-3">
                      <ChefHat className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Dinner</h3>
                      <p className="text-sm text-muted-foreground">
                        {todayPlan.days[0].dinner.title}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleViewPlans}
                  >
                    View Full Plan
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-12 text-center">
                  <ChefHat className="mx-auto h-10 w-10 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">
                    No plan for today
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Generate a meal plan to get started with your nutrition
                    goals.
                  </p>
                  <Button className="mt-4" onClick={handleGeneratePlan}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Plan
                  </Button>
                </div>
              )
            ) : (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-auto flex-col items-center justify-center gap-2 p-6 hover:bg-accent"
                onClick={handleGeneratePlan}
              >
                <Sparkles className="h-6 w-6" />
                <span>Generate Plan</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col items-center justify-center gap-2 p-6 hover:bg-accent"
                onClick={handleViewPlans}
              >
                <CalendarDays className="h-6 w-6" />
                <span>My Plans</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col items-center justify-center gap-2 p-6 hover:bg-accent"
                onClick={handleViewRecipes}
              >
                <ChefHat className="h-6 w-6" />
                <span>Recipes</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col items-center justify-center gap-2 p-6 hover:bg-accent"
                onClick={() => router.push('/settings')}
              >
                <TrendingUp className="h-6 w-6" />
                <span>Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
