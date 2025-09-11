"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CUISINES } from "@/lib/constants";

export function RecipeFilter({
  initialCuisine,
  initialMealType,
}: {
  initialCuisine: string;
  initialMealType: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("RecipesPage");

  const [searchTerm, setSearchTerm] = useState(searchParams.get("query") || "");

  const handleFilterChange = (
    type: "query" | "cuisine" | "mealType",
    value: string,
  ) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    if (type === "query") {
      setSearchTerm(value);
      if (!value) {
        current.delete("query");
      } else {
        current.set("query", value);
      }
    }
    if (type === "cuisine") {
      if (value === "Any") {
        current.delete("cuisine");
      } else {
        current.set("cuisine", value);
      }
    }
    if (type === "mealType") {
      if (value === "All") {
        current.delete("mealType");
      } else {
        current.set("mealType", value);
      }
    }

    const search = current.toString();
    const query = search ? `?${search}` : "";

    // Use a timeout to debounce search input
    if (type === "query") {
      const timeoutId = setTimeout(() => {
        router.push(`${pathname}${query}`);
      }, 500);
      return () => clearTimeout(timeoutId);
    }

    router.push(`${pathname}${query}`);
  };

  const mealTypes = ["All", "Breakfast", "Lunch", "Dinner"];

  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row">
        <Input
          placeholder={t("search_recipes_placeholder")}
          className="flex-grow"
          value={searchTerm}
          onChange={(e) => handleFilterChange("query", e.target.value)}
        />
        <Select
          value={initialCuisine}
          onValueChange={(value) => handleFilterChange("cuisine", value)}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder={t("filter_by_cuisine")} />
          </SelectTrigger>
          <SelectContent>
            {CUISINES.map((cuisine) => (
              <SelectItem key={cuisine} value={cuisine}>
                {cuisine}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs
        value={initialMealType}
        onValueChange={(value) => handleFilterChange("mealType", value)}
        className="w-full"
      >
        <TabsList>
          {mealTypes.map((type) => (
            <TabsTrigger key={type} value={type}>
              {type}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </>
  );
}
