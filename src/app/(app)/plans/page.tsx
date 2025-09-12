'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  PlusCircle,
  ChefHat,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import {
  addDays,
  format,
  startOfDay,
  getDaysInMonth,
  startOfMonth,
  getDay,
  subMonths,
  addMonths,
  isToday as checkIsToday,
} from 'date-fns';

import { Button } from '@/components/ui/button';
import { getMealPlans } from '@/services/meal-plan-service';
import type { MealPlan, DailyPlan } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

type PlansByDate = Map<
  string,
  { plan: DailyPlan; planId: string; details: MealPlan }
>;

export default function PlansPage() {
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const router = useRouter();

  useEffect(() => {
    async function fetchPlans() {
      const fetchedPlans = await getMealPlans();
      setPlans(fetchedPlans);
      setIsLoaded(true);
    }
    fetchPlans();
  }, []);

  const plansByDate = useMemo((): PlansByDate => {
    const map: PlansByDate = new Map();
    if (!isLoaded) return map;

    plans.forEach(plan => {
      const startDate = startOfDay(new Date(plan.createdAt));
      plan.days.forEach((day, index) => {
        const date = addDays(startDate, index);
        const dateKey = format(date, 'yyyy-MM-dd');
        map.set(dateKey, { plan: day, planId: plan.id, details: plan });
      });
    });
    return map;
  }, [plans, isLoaded]);

  const selectedDateKey = format(selectedDate, 'yyyy-MM-dd');
  const selectedDayData = plansByDate.get(selectedDateKey);
  const selectedDayPlan = selectedDayData?.plan;

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = startOfMonth(currentDate);
  const startingDayOfWeek = getDay(firstDayOfMonth); // 0 (Sun) to 6 (Sat)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: startingDayOfWeek }, (_, i) => i);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleRegenerate = () => {
    if (!selectedDayData) return;
    const { details } = selectedDayData;
    const query = new URLSearchParams({
      planId: details.id,
      dietaryPreferences: details.dietaryPreferences,
      calorieTarget: details.calorieTarget.toString(),
      allergies: details.allergies,
      cuisine: details.cuisine,
      date: format(selectedDate, 'yyyy-MM-dd'),
    }).toString();
    router.push(`/generate?${query}`);
  };

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
            <CardHeader className="flex flex-row items-center justify-between p-4">
              <h3 className="text-xl font-semibold font-headline">
                {format(currentDate, 'MMMM yyyy')}
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-2 md:p-4">
              <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-muted-foreground">
                {weekDays.map(day => (
                  <div key={day} className="py-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {emptyDays.map(d => (
                  <div key={`empty-${d}`} className="h-16"></div>
                ))}
                {days.map(day => {
                  const date = new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    day
                  );
                  const dateKey = format(date, 'yyyy-MM-dd');
                  const hasPlan = plansByDate.has(dateKey);
                  const isSelected = selectedDateKey === dateKey;
                  const isToday = checkIsToday(date);

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(date)}
                      className={cn(
                        'relative flex h-16 w-full items-start justify-start p-2 text-sm transition-colors rounded-md',
                        'hover:bg-accent hover:text-accent-foreground',
                        isSelected
                          ? 'bg-primary text-primary-foreground hover:bg-primary'
                          : 'bg-transparent',
                        isToday && !isSelected && 'bg-secondary/50'
                      )}
                    >
                      <span
                        className={cn(
                          'flex items-center justify-center rounded-full h-6 w-6',
                          isSelected &&
                            'bg-primary-foreground text-primary font-bold'
                        )}
                      >
                        {day}
                      </span>
                      {hasPlan && (
                        <span
                          className={cn(
                            'absolute bottom-2 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full',
                            isSelected ? 'bg-primary-foreground' : 'bg-primary'
                          )}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 lg:col-span-1">
          <h3 className="text-2xl font-semibold font-headline">
            {selectedDate ? format(selectedDate, 'PPP') : 'Select a date'}
          </h3>
          {selectedDayPlan ? (
            <div className="space-y-4 animate-in fade-in-0 zoom-in-95">
              <Link
                href={`/recipes/${selectedDayPlan.breakfast.id}`}
                className="group block"
              >
                <Card className="transition-shadow group-hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Breakfast: {selectedDayPlan.breakfast.title}
                    </CardTitle>
                    <CardDescription>
                      {selectedDayPlan.breakfast.calories} calories
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
              <Link
                href={`/recipes/${selectedDayPlan.lunch.id}`}
                className="group block"
              >
                <Card className="transition-shadow group-hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Lunch: {selectedDayPlan.lunch.title}
                    </CardTitle>
                    <CardDescription>
                      {selectedDayPlan.lunch.calories} calories
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
              <Link
                href={`/recipes/${selectedDayPlan.dinner.id}`}
                className="group block"
              >
                <Card className="transition-shadow group-hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Dinner: {selectedDayPlan.dinner.title}
                    </CardTitle>
                    <CardDescription>
                      {selectedDayPlan.dinner.calories} calories
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
              <Separator />
              <Button onClick={handleRegenerate} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerate Plan
              </Button>
            </div>
          ) : (
            <Card className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/30 py-16 text-center h-full animate-in fade-in-0 zoom-in-95">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <ChefHat className="mx-auto h-12 w-12 text-muted-foreground" />
                <h4 className="mt-4 text-lg font-semibold">
                  No Plan for This Day
                </h4>
                <p className="mt-2 text-sm text-muted-foreground">
                  Generate a new plan to fill your calendar.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
