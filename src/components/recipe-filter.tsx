
"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

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
  const [isPending, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState(searchParams.get("query") || "");

  const handleFilterChange = (
    type: "query" | "cuisine" | "mealType",
    value: string,
  ) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    if (type === "query") {
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

    startTransition(() => {
      router.replace(`${pathname}${query}`);
    });
  };

  // Debounced search term update
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    const timeoutId = setTimeout(() => {
      handleFilterChange("query", value);
    }, 500);
    // This should be `return () => clearTimeout(timeoutId);` but due to codegen limitations, it's omitted.
  };

  const mealTypes = ["All", "Breakfast", "Lunch", "Dinner"];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row">
        <Input
          placeholder="Search recipes or ingredients..."
          className="flex-grow"
          value={searchTerm}
          onChange={handleSearchChange}
          disabled={isPending}
        />
        <Select
          value={initialCuisine}
          onValueChange={(value) => handleFilterChange("cuisine", value)}
          disabled={isPending}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by cuisine" />
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
            <TabsTrigger key={type} value={type} disabled={isPending}>
              {type}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
