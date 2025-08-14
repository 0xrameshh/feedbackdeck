'use client';

import React from 'react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { PieChart, Pie, LineChart, Line, BarChart, Bar, CartesianGrid, XAxis, Label } from "recharts";

interface FeedbackStats {
  totalFeedback: number;
  pending: number;
  responded: number;
  thisWeek: number;
  activeSites: number;
  responseRate: number;
  weeklyData: number[];
  categoryData: {
    general: number;
    bug: number;
    feature: number;
    praise: number;
  };
}

interface FeedbackChartsProps {
  stats: FeedbackStats;
}

export function FeedbackPieChart({ stats }: FeedbackChartsProps) {
  const chartData = React.useMemo(() => [
    { category: "General", count: stats.categoryData?.general || 0, fill: "var(--color-general)" },
    { category: "Bug", count: stats.categoryData?.bug || 0, fill: "var(--color-bug)" },
    { category: "Feature", count: stats.categoryData?.feature || 0, fill: "var(--color-feature)" },
    { category: "Praise", count: stats.categoryData?.praise || 0, fill: "var(--color-praise)" },
  ], [stats.categoryData]);

  const chartConfig = {
    general: {
      label: "General",
      color: "var(--chart-1)",
    },
    bug: {
      label: "Bug",
      color: "var(--chart-2)",
    },
    feature: {
      label: "Feature",
      color: "var(--chart-3)",
    },
    praise: {
      label: "Praise",
      color: "var(--chart-4)",
    },
  } satisfies ChartConfig;

  const totalCount = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.count, 0);
  }, [chartData]);

  return (
    <div className="w-full">
      <div className="flex flex-col space-y-2 mb-4">
        <div className="text-lg font-semibold">Category Breakdown</div>
        <div className="text-sm text-muted-foreground">
          Feedback distribution by category
        </div>
      </div>
      <ChartContainer
        config={chartConfig}
        className="h-[350px] w-full"
      >
        <PieChart>
          <ChartTooltip
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={chartData}
            dataKey="count"
            nameKey="category"
            innerRadius={60}
            strokeWidth={5}
          >
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="fill-foreground text-3xl font-bold"
                      >
                        {totalCount.toLocaleString()}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 24}
                        className="fill-muted-foreground"
                      >
                        Total
                      </tspan>
                    </text>
                  );
                }
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>
    </div>
  );
}

export function FeedbackLineChart({ stats }: FeedbackChartsProps) {
  const chartData = React.useMemo(() => [
    { day: "Mon", feedback: stats.weeklyData?.[0] || 0 },
    { day: "Tue", feedback: stats.weeklyData?.[1] || 0 },
    { day: "Wed", feedback: stats.weeklyData?.[2] || 0 },
    { day: "Thu", feedback: stats.weeklyData?.[3] || 0 },
    { day: "Fri", feedback: stats.weeklyData?.[4] || 0 },
    { day: "Sat", feedback: stats.weeklyData?.[5] || 0 },
    { day: "Sun", feedback: stats.weeklyData?.[6] || 0 },
  ], [stats.weeklyData]);

  const chartConfig = {
    feedback: {
      label: "Feedback",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  return (
    <div className="w-full">
      <div className="flex flex-col space-y-2 mb-4">
        <div className="text-lg font-semibold">Weekly Trend</div>
        <div className="text-sm text-muted-foreground">
          Daily feedback over the last 7 days
        </div>
      </div>
      <ChartContainer config={chartConfig} className="h-[350px] w-full">
        <LineChart
          accessibilityLayer
          data={chartData}
          margin={{
            left: 12,
            right: 12,
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
            content={<ChartTooltipContent hideLabel />}
          />
          <Line
            dataKey="feedback"
            type="natural"
            stroke="var(--color-feedback)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
}

export function FeedbackBarChart({ stats }: FeedbackChartsProps) {
  const chartData = React.useMemo(() => [
    { category: "General", count: stats.categoryData?.general || 0 },
    { category: "Bug", count: stats.categoryData?.bug || 0 },
    { category: "Feature", count: stats.categoryData?.feature || 0 },
    { category: "Praise", count: stats.categoryData?.praise || 0 },
  ], [stats.categoryData]);

  const chartConfig = {
    count: {
      label: "Count",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  return (
    <div className="w-full">
      <div className="flex flex-col space-y-2 mb-4">
        <div className="text-lg font-semibold">Category Counts</div>
        <div className="text-sm text-muted-foreground">
          Number of feedback items by category
        </div>
      </div>
      <ChartContainer config={chartConfig} className="h-[350px] w-full">
        <BarChart accessibilityLayer data={chartData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="category"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />
          <ChartTooltip
            content={<ChartTooltipContent indicator="dashed" />}
          />
          <Bar dataKey="count" fill="var(--color-count)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}