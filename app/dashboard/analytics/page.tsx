'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, MessageSquare, Clock } from "lucide-react";
import { FeedbackPieChart, FeedbackLineChart, FeedbackBarChart } from '@/components/charts/feedback-charts';

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
  // const [projects, setProjects] = useState<Project[]>([]); // Currently unused
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    // fetchProjects(); // Not currently needed
    fetchStats();
  }, [fetchStats]);

  // const fetchProjects = async () => {
  //   try {
  //     const response = await fetch('/api/projects');
  //     if (response.ok) {
  //       const data = await response.json();
  //       setProjects(data.projects || []);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching projects:', error);
  //   }
  // };

  if (loading) {
    return (
      <div className="w-full">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded mb-6 w-1/4"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
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
              </div>
              <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">This Week</p>
                <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">{stats.thisWeek}</div>
              </div>
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Response Rate</p>
                <div className="text-2xl sm:text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.responseRate}%</div>
              </div>
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 sm:gap-6">
        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
          <Card className="p-4 sm:p-6">
            <FeedbackPieChart stats={stats} />
          </Card>
          <Card className="p-4 sm:p-6">
            <FeedbackLineChart stats={stats} />
          </Card>
        </div>
        <Card className="p-4 sm:p-6">
          <FeedbackBarChart stats={stats} />
        </Card>
      </div>
    </div>
  );
}