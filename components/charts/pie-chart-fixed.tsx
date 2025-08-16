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
  stats?: {
    categoryData: {
      general: number;
      bug: number;
      feature: number;
      praise: number;
    };
  };
}

const chartConfig = {
  feedback: {
    label: "Feedback",
  },
  general: {
    label: "General",
    color: "var(--chart-1)",
  },
  bug: {
    label: "Bug Reports",
    color: "var(--chart-2)",
  },
  feature: {
    label: "Feature Requests",
    color: "var(--chart-3)",
  },
  praise: {
    label: "Praise",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig

export function ChartPieLabel({ stats }: ChartPieLabelProps) {
  // Transform data for the chart or use default data
  const chartData = stats ? 
    [
      { category: "general", feedback: stats.categoryData.general, fill: "var(--color-general)" },
      { category: "bug", feedback: stats.categoryData.bug, fill: "var(--color-bug)" },
      { category: "feature", feedback: stats.categoryData.feature, fill: "var(--color-feature)" },
      { category: "praise", feedback: stats.categoryData.praise, fill: "var(--color-praise)" },
    ].filter(item => item.feedback > 0) :
    [
      { category: "general", feedback: 45, fill: "var(--color-general)" },
      { category: "bug", feedback: 25, fill: "var(--color-bug)" },
      { category: "feature", feedback: 20, fill: "var(--color-feature)" },
      { category: "praise", feedback: 10, fill: "var(--color-praise)" },
    ];

  const total = chartData.reduce((sum, item) => sum + item.feedback, 0);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Category Breakdown</CardTitle>
        <CardDescription>Distribution of feedback by type</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square max-h-[250px] pb-0"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie data={chartData} dataKey="feedback" label nameKey="category" />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Total feedback: {total} <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing feedback distribution by category
        </div>
      </CardFooter>
    </Card>
  )
}