
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlusCircle, CalendarDays, Flame } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { getLongTermMealPlans } from '@/services/meal-plan-service';
import type { LongTermMealPlan } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';


export default function PlansPage() {
  const [plans, setPlans] = useState<LongTermMealPlan[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchPlans() {
      // Assuming a static userId for now
      const fetchedPlans = await getLongTermMealPlans('anonymous');
      setPlans(fetchedPlans);
      setIsLoaded(true);
    }
    fetchPlans();
  }, []);
  
  if (!isLoaded) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight font-headline">
            My Meal Plans
          </h2>
          <p className="text-muted-foreground">
            View your generated long-term meal plans.
          </p>
        </div>
        <Button onClick={() => router.push('/generate')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Generate New Plan
        </Button>
      </div>

      <div className="space-y-8">
        {plans.length > 0 ? (
          plans.map((plan) => (
            <Card key={plan.id} className="overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">
                       {plan.days.length}-Day Plan
                    </CardTitle>
                    <CardDescription>
                       Generated on {format(plan.createdAt.toDate(), 'PPP')}
                    </CardDescription>
                    <div className="flex flex-wrap gap-2 pt-2">
                        <Badge variant="secondary">{plan.cuisine}</Badge>
                        <Badge variant="outline">{plan.dietaryPreferences}</Badge>
                         <Badge variant="outline">{plan.calorieTarget} kcal/day</Badge>
                    </div>
                </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {plan.days.map((day, index) => (
                    <AccordionItem value={`day-${index}`} key={index}>
                      <AccordionTrigger className="text-lg font-semibold">
                        Day {index + 1}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-2">
                           <Link href={`/recipes/${day.breakfast.id}`} className="group block">
                             <Card className="transition-shadow group-hover:shadow-md">
                               <CardHeader>
                                 <CardTitle>Breakfast: {day.breakfast.title}</CardTitle>
                                 <CardDescription>{day.breakfast.calories} calories</CardDescription>
                               </CardHeader>
                             </Card>
                           </Link>
                           <Link href={`/recipes/${day.lunch.id}`} className="group block">
                            <Card className="transition-shadow group-hover:shadow-md">
                               <CardHeader>
                                 <CardTitle>Lunch: {day.lunch.title}</CardTitle>
                                 <CardDescription>{day.lunch.calories} calories</CardDescription>
                               </CardHeader>
                             </Card>
                           </Link>
                           <Link href={`/recipes/${day.dinner.id}`} className="group block">
                            <Card className="transition-shadow group-hover:shadow-md">
                               <CardHeader>
                                 <CardTitle>Dinner: {day.dinner.title}</CardTitle>
                                 <CardDescription>{day.dinner.calories} calories</CardDescription>
                               </CardHeader>
                             </Card>
                           </Link>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-24 text-center">
            <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-xl font-semibold">No Plans Yet</h3>
            <p className="text-muted-foreground">Click "Generate New Plan" to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
