"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

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

export const description = "A vertical bar chart"

interface ChartBarVerticalProps {
  stats?: {
    weeklyData: number[];
  };
}

const chartConfig = {
  feedback: {
    label: "Feedback",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function ChartBarVertical({ stats }: ChartBarVerticalProps) {
  // Generate chart data from weekly stats or use default data
  const chartData = stats ? 
    stats.weeklyData.map((count, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        feedback: count
      };
    }) : 
    [
      { day: "Mon", feedback: 12 },
      { day: "Tue", feedback: 19 },
      { day: "Wed", feedback: 3 },
      { day: "Thu", feedback: 15 },
      { day: "Fri", feedback: 8 },
      { day: "Sat", feedback: 7 },
      { day: "Sun", feedback: 10 },
    ];

  const totalFeedback = chartData.reduce((sum, item) => sum + item.feedback, 0);
  const avgDaily = Math.round(totalFeedback / 7);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Breakdown</CardTitle>
        <CardDescription>Feedback count by day of week</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 20,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="feedback" fill="var(--color-feedback)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Average daily feedback: {avgDaily} <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing daily feedback for the last 7 days
        </div>
      </CardFooter>
    </Card>
  )
}