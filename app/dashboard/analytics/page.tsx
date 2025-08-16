'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, TrendingUp, Clock } from "lucide-react";
import { ChartBarLabel } from "@/components/charts/bar-chart-label";
import { ChartPieLabel } from "@/components/charts/pie-chart-fixed";

interface AnalyticsStats {
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

export default function AnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        setStats({
          totalFeedback: 0,
          pending: 0,
          responded: 0,
          thisWeek: 0,
          activeSites: 0,
          responseRate: 0,
          weeklyData: [0, 0, 0, 0, 0, 0, 0],
          categoryData: { general: 0, bug: 0, feature: 0, praise: 0 }
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({
        totalFeedback: 0,
        pending: 0,
        responded: 0,
        thisWeek: 0,
        activeSites: 0,
        responseRate: 0,
        weeklyData: [0, 0, 0, 0, 0, 0, 0],
        categoryData: { general: 0, bug: 0, feature: 0, praise: 0 }
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full">

        <div className="animate-pulse space-y-8">
          <div className="space-y-3">
            <div className="h-8 bg-gray-200 rounded mb-6 w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">Analytics</h1>
        <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
          Insights from your feedback collection
        </p>
      </div>

      {/* Key Metrics */}

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-6 sm:mb-8">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Total Feedback</p>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.totalFeedback}</div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">+12% from last week</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">This Week</p>
                <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">{stats.thisWeek}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">New feedback received</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Response Rate</p>
                <div className="text-2xl sm:text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.responseRate}%</div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Average response time: 2h</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Daily feedback bar chart */}
        <ChartBarLabel stats={stats} />
        
        {/* Category breakdown pie chart */}
        <ChartPieLabel stats={stats} />
      </div>
    </div>
  );
}