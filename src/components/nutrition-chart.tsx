"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  calories: {
    label: "Calories",
    color: "hsl(var(--chart-1))",
  },
  protein: {
    label: "Protein (g)",
    color: "hsl(var(--chart-2))",
  },
  carbs: {
    label: "Carbs (g)",
    color: "hsl(var(--chart-1))",
  },
  fat: {
    label: "Fat (g)",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function NutritionChart({ data, title, description, type }: { data: any[], title: string, description: string, type: "macros" | "calories" }) {
  const key = type === 'macros' ? 'macros' : 'calories';

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64">
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            {type === 'macros' ? (
                <>
                    <Bar dataKey="protein" fill="var(--color-protein)" radius={4} />
                    <Bar dataKey="carbs" fill="var(--color-carbs)" radius={4} />
                    <Bar dataKey="fat" fill="var(--color-fat)" radius={4} />
                </>
            ) : (
                <Bar dataKey="calories" fill="var(--color-calories)" radius={4} />
            )}

          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
