"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"

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

export const description = "A bar chart with a label"

interface ChartBarLabelProps {
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

export function ChartBarLabel({ stats }: ChartBarLabelProps) {
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

  const totalFeedback = chartData.reduce((sum, item) => sum + item.feedback, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Feedback</CardTitle>
        <CardDescription>Feedback count for the last 7 days</CardDescription>
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
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="feedback" fill="var(--color-feedback)" radius={8}>
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
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