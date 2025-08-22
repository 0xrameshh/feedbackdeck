"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

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

export const description = "A line chart with dots"

interface ChartLineDotsProps {
  stats?: {
    weeklyData: number[];
  };
}

const chartConfig = {
  feedback: {
    label: "Feedback",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function ChartLineDots({ stats }: ChartLineDotsProps) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feedback Trend</CardTitle>
        <CardDescription>Daily feedback over the last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
              top: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey="feedback"
              type="natural"
              stroke="var(--color-feedback)"
              strokeWidth={2}
              dot={{
                fill: "var(--color-feedback)",
              }}
              activeDot={{
                r: 6,
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Total feedback this week: {totalFeedback} <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing daily feedback for the last 7 days
        </div>
      </CardFooter>
    </Card>
  )
}
    