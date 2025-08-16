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

export const description = "A donut chart showing feedback status"

interface StatusDonutChartProps {
  stats?: {
    pending: number;
    responded: number;
  };
}

const chartConfig = {
  feedback: {
    label: "Feedback",
  },
  pending: {
    label: "Pending",
    color: "var(--chart-3)",
  },
  responded: {
    label: "Responded",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function StatusDonutChart({ stats }: StatusDonutChartProps) {
  // Transform data for the chart or use default data
  const chartData = stats ? 
    [
      { status: "responded", count: stats.responded, fill: "var(--color-responded)" },
      { status: "pending", count: stats.pending, fill: "var(--color-pending)" },
    ].filter(item => item.count > 0) :
    [
      { status: "responded", count: 23, fill: "var(--color-responded)" },
      { status: "pending", count: 18, fill: "var(--color-pending)" },
    ];

  const total = chartData.reduce((sum, item) => sum + item.count, 0);
  const responseRate = stats ? Math.round((stats.responded / (stats.responded + stats.pending)) * 100) : 56;

  if (total === 0) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Response Status</CardTitle>
          <CardDescription>Pending vs responded feedback</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <div className="flex items-center justify-center h-[250px] text-muted-foreground">
            No feedback data available yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Response Status</CardTitle>
        <CardDescription>Pending vs responded feedback</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px] pb-0"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie 
              data={chartData} 
              dataKey="count" 
              nameKey="status"
              innerRadius={60}
              strokeWidth={5}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Response rate: {responseRate}% <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing response status distribution
        </div>
      </CardFooter>
    </Card>
  )
}