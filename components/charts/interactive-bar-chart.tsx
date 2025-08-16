"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

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

export const description = "An interactive bar chart"

interface ChartBarInteractiveProps {
  stats?: {
    weeklyData: number[];
  };
}


const chartConfig = {
  views: {
    label: "Feedback",
  },
  thisWeek: {
    label: "This Week",
    color: "var(--chart-1)",
  },
  lastWeek: {
    label: "Last Week", 
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function ChartBarInteractive({ stats }: ChartBarInteractiveProps) {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("thisWeek")

  // Generate chart data from stats or use default data
  const chartData = React.useMemo(() => {
    if (stats) {
      return stats.weeklyData.map((count, index) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - index));
        // Simulate comparison with previous week by adding some variation
        const lastWeekCount = Math.max(0, count + Math.floor(Math.random() * 10) - 5);
        return {
          date: date.toISOString().split('T')[0],
          thisWeek: count,
          lastWeek: lastWeekCount,
        };
      });
    }
    return [
      { date: "2024-08-10", thisWeek: 12, lastWeek: 8 },
      { date: "2024-08-11", thisWeek: 19, lastWeek: 15 },
      { date: "2024-08-12", thisWeek: 3, lastWeek: 7 },
      { date: "2024-08-13", thisWeek: 15, lastWeek: 12 },
      { date: "2024-08-14", thisWeek: 8, lastWeek: 10 },
      { date: "2024-08-15", thisWeek: 7, lastWeek: 5 },
      { date: "2024-08-16", thisWeek: 10, lastWeek: 9 },
    ];
  }, [stats]);

  const total = React.useMemo(
    () => ({
      thisWeek: chartData.reduce((acc, curr) => acc + curr.thisWeek, 0),
      lastWeek: chartData.reduce((acc, curr) => acc + curr.lastWeek, 0),
    }),
    [chartData]
  )

  return (
    <Card className="py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-0">
          <CardTitle>Feedback Comparison</CardTitle>
          <CardDescription>
            Daily feedback comparison over the last 7 days
          </CardDescription>
        </div>
        <div className="flex">
          {["thisWeek", "lastWeek"].map((key) => {
            const chart = key as keyof typeof chartConfig
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-muted-foreground text-xs">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg leading-none font-bold sm:text-3xl">
                  {total[key as keyof typeof total].toLocaleString()}
                </span>
              </button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="views"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                />
              }
            />
            <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
