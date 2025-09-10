'use client';
import {Flame, Beef, Wheat, Droplets } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NutritionChart } from '@/components/nutrition-chart';
import { useUserProfile } from '@/hooks/use-user-profile';
import { Skeleton } from '@/components/ui/skeleton';

const macroData = [
  { name: 'Your Intake', protein: 110, carbs: 180, fat: 60 },
  { name: 'Goal', protein: 150, carbs: 220, fat: 70 },
];

const calorieData = [
    { name: 'Your Intake', calories: 1800 },
    { name: 'Goal', calories: 2200 },
]

export default function Dashboard() {
  const { profile, isLoaded } = useUserProfile();

  if (!isLoaded) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-5 w-1/2" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  const calorieSummary = { value: '1,750', goal: profile.calorieTarget };
  const proteinSummary = { value: '130g', goal: '150g' };
  const carbsSummary = { value: '210g', goal: '250g' };
  const fatSummary = { value: '60g', goal: '70g' };
  
  const calorieData = [
    { name: 'Your Intake', calories: 1750 },
    { name: 'Goal', calories: profile.calorieTarget },
  ]

  const macroData = [
    { name: 'Your Intake', protein: 130, carbs: 210, fat: 60 },
    { name: 'Goal', protein: 150, carbs: 250, fat: 70 },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">
          Welcome back, {profile.name}!
        </h2>
        <p className="text-muted-foreground">
          Here is a summary of your nutrition for today.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calories</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calorieSummary.value}</div>
            <p className="text-xs text-muted-foreground">
              Goal: {calorieSummary.goal} kcal
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Protein</CardTitle>
            <Beef className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{proteinSummary.value}</div>
            <p className="text-xs text-muted-foreground">
              Goal: {proteinSummary.goal}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Carbohydrates</CardTitle>
            <Wheat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{carbsSummary.value}</div>
            <p className="text-xs text-muted-foreground">
              Goal: {carbsSummary.goal}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fat</CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fatSummary.value}</div>
            <p className="text-xs text-muted-foreground">
              Goal: {fatSummary.goal}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <NutritionChart 
            data={calorieData} 
            title="Calorie Intake" 
            description="Your daily calorie intake vs your goal."
            type="calories"
        />
        <NutritionChart 
            data={macroData} 
            title="Macronutrient Breakdown"
            description="Your daily macro intake vs your goals."
            type="macros"
        />
      </div>
    </div>
  );
}
