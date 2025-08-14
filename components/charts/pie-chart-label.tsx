"use client"

import { TrendingUp } from "lucide-react"
import { Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "A pie chart with a label"

interface ChartPieLabelProps {
  categoryData?: {
    general: number;
    bug: number;
    feature: number;
    praise: number;
  };
}

export default function ChartPieLabel({ categoryData }: ChartPieLabelProps = {}) {
  const chartData = [
    { browser: "general", visitors: categoryData?.general || 0, fill: "var(--color-general)" },
    { browser: "bug", visitors: categoryData?.bug || 0, fill: "var(--color-bug)" },
    { browser: "feature", visitors: categoryData?.feature || 0, fill: "var(--color-feature)" },
    { browser: "praise", visitors: categoryData?.praise || 0, fill: "var(--color-praise)" },
  ]

  const chartConfig = {
    visitors: {
      label: "Visitors",
    },
    general: {
      label: "General",
      color: "hsl(var(--chart-1))",
    },
    bug: {
      label: "Bug",
      color: "hsl(var(--chart-2))",
    },
    feature: {
      label: "Feature",
      color: "hsl(var(--chart-3))",
    },
    praise: {
      label: "Praise",
      color: "hsl(var(--chart-4))",
    },
  } satisfies ChartConfig

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Pie Chart - Label</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px] min-h-[200px] pb-0"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie data={chartData} dataKey="visitors" label nameKey="browser" />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
  )
}