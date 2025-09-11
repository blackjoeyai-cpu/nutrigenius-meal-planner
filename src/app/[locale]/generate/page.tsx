
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DailyPlanForm } from "@/components/daily-plan-form";
import { LongTermPlanForm } from "@/components/long-term-plan-form";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";
import { getRecipes } from "@/services/recipe-service";
import type { Recipe } from "@/lib/types";

export default function GeneratePage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipesLoaded, setRecipesLoaded] = useState(false);
  const t = useTranslations("GeneratePage");

  useEffect(() => {
    getRecipes().then((r) => {
      setRecipes(r);
      setRecipesLoaded(true);
    });
  }, []);

  if (!recipesLoaded) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  return (
    <Tabs defaultValue="daily" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="daily">{t('daily_plan')}</TabsTrigger>
        <TabsTrigger value="long-term">{t('long_term_plan')}</TabsTrigger>
      </TabsList>
      <TabsContent value="daily">
        <DailyPlanForm recipes={recipes} />
      </TabsContent>
      <TabsContent value="long-term">
        <LongTermPlanForm recipes={recipes} />
      </TabsContent>
    </Tabs>
  );
}
