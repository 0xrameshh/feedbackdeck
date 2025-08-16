"use client"

import { TrendingUp, TrendingDown } from "lucide-react"
import { Bar, BarChart, XAxis, YAxis } from "recharts"

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

export const description = "A horizontal bar chart"

interface ChartBarHorizontalProps {
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

export function ChartBarHorizontal({ stats }: ChartBarHorizontalProps) {
  // Generate chart data from weekly stats or use default data
  const chartData = stats ? 
    stats.weeklyData.map((count, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      return {
        day: date.toLocaleDateString('en-US', { weekday: 'long' }),
        feedback: count
      };
    }) : 
    [
      { day: "Monday", feedback: 12 },
      { day: "Tuesday", feedback: 19 },
      { day: "Wednesday", feedback: 3 },
      { day: "Thursday", feedback: 15 },
      { day: "Friday", feedback: 8 },
      { day: "Saturday", feedback: 7 },
      { day: "Sunday", feedback: 10 },
    ];

  // Calculate trend
  const trend = stats ? (() => {
    const lastWeek = stats.weeklyData.slice(0, 3).reduce((a, b) => a + b, 0);
    const thisWeek = stats.weeklyData.slice(4).reduce((a, b) => a + b, 0);
    return lastWeek > 0 ? ((thisWeek - lastWeek) / lastWeek * 100).toFixed(1) : 0;
  })() : "5.2";
  
  const isPositive = Number(trend) >= 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Feedback Overview</CardTitle>
        <CardDescription>Daily feedback breakdown for the last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              left: -20,
            }}
          >
            <XAxis type="number" dataKey="feedback" hide />
            <YAxis
              dataKey="day"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="feedback" fill="var(--color-feedback)" radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          {isPositive ? (
            <>
              Trending up by {Math.abs(Number(trend))}% this week <TrendingUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Trending down by {Math.abs(Number(trend))}% this week <TrendingDown className="h-4 w-4" />
            </>
          )}
        </div>
        <div className="text-muted-foreground leading-none">
          Showing daily feedback for the last 7 days
        </div>
      </CardFooter>
    </Card>
  )
}