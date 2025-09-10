
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PlusCircle, ChefHat } from 'lucide-react';
import { addDays, format, startOfDay } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { getLongTermMealPlans } from '@/services/meal-plan-service';
import type { LongTermMealPlan, DailyPlan } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type PlansByDate = Map<string, DailyPlan>;

export default function PlansPage() {
  const [plans, setPlans] = useState<LongTermMealPlan[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const router = useRouter();

  useEffect(() => {
    async function fetchPlans() {
      const fetchedPlans = await getLongTermMealPlans('anonymous');
      setPlans(fetchedPlans);
      setIsLoaded(true);
    }
    fetchPlans();
  }, []);

  const plansByDate = useMemo((): PlansByDate => {
    const map: PlansByDate = new Map();
    if (!isLoaded) return map;

    plans.forEach((plan) => {
      const startDate = startOfDay(new Date(plan.createdAt));
      plan.days.forEach((day, index) => {
        const date = addDays(startDate, index);
        map.set(date.toISOString().split('T')[0], day);
      });
    });
    return map;
  }, [plans, isLoaded]);

  const plannedDays = useMemo(() => {
    return Array.from(plansByDate.keys()).map((dateStr) => new Date(dateStr));
  }, [plansByDate]);

  const selectedDayPlan = selectedDate ? plansByDate.get(selectedDate.toISOString().split('T')[0]) : null;

  if (!isLoaded) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <Skeleton className="h-96 w-full" />
          </div>
          <div className="md:col-span-1 space-y-4">
             <Skeleton className="h-10 w-full" />
             <Skeleton className="h-32 w-full" />
             <Skeleton className="h-32 w-full" />
             <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight font-headline">
            My Meal Calendar
          </h2>
          <p className="text-muted-foreground">
            Select a date to view your meal plan.
          </p>
        </div>
        <Button onClick={() => router.push('/generate')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Generate New Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-2 md:p-6">
               <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  modifiers={{ planned: plannedDays }}
                  modifiersClassNames={{
                      planned: 'bg-primary/20 text-primary-foreground rounded-full',
                  }}
                  className="w-full"
              />
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-4 lg:col-span-1">
             <h3 className="text-2xl font-semibold font-headline">
                {selectedDate ? format(selectedDate, 'PPP') : 'Select a date'}
            </h3>
            {selectedDayPlan ? (
                <div className="space-y-4">
                     <Link href={`/recipes/${selectedDayPlan.breakfast.id}`} className="group block">
                        <Card className="transition-shadow group-hover:shadow-md">
                        <CardHeader>
                            <CardTitle className="text-lg">Breakfast: {selectedDayPlan.breakfast.title}</CardTitle>
                            <CardDescription>{selectedDayPlan.breakfast.calories} calories</CardDescription>
                        </CardHeader>
                        </Card>
                    </Link>
                    <Link href={`/recipes/${selectedDayPlan.lunch.id}`} className="group block">
                        <Card className="transition-shadow group-hover:shadow-md">
                        <CardHeader>
                            <CardTitle className="text-lg">Lunch: {selectedDayPlan.lunch.title}</CardTitle>
                            <CardDescription>{selectedDayPlan.lunch.calories} calories</CardDescription>
                        </CardHeader>
                        </Card>
                    </Link>
                     <Link href={`/recipes/${selectedDayPlan.dinner.id}`} className="group block">
                        <Card className="transition-shadow group-hover:shadow-md">
                        <CardHeader>
                            <CardTitle className="text-lg">Dinner: {selectedDayPlan.dinner.title}</CardTitle>
                            <CardDescription>{selectedDayPlan.dinner.calories} calories</CardDescription>
                        </CardHeader>
                        </Card>
                    </Link>
                </div>
            ) : (
                <Card className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/30 py-16 text-center h-full">
                    <CardContent className="flex flex-col items-center justify-center p-6">
                        <ChefHat className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h4 className="mt-4 text-lg font-semibold">No Plan for This Day</h4>
                        <p className="mt-2 text-sm text-muted-foreground">Generate a new plan to fill your calendar.</p>
                    </CardContent>
                </Card>
            )}
        </div>
      </div>
    </div>
  );
}
