'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { FeedbackDashboard } from "@/components/feedback-dashboard";
import { MessageSquare, Clock } from "lucide-react";
import type { Project } from "@/db/schema";

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

export default function FeedbackPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
    fetchStats();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

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
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded mb-6 w-1/4"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">Feedback</h1>
        <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
          Manage feedback from your websites
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 mb-6 sm:mb-8">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Total</p>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{stats?.totalFeedback || 0}</div>
              </div>
              <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Pending</p>
                <div className="text-2xl sm:text-3xl font-bold text-orange-600 dark:text-orange-400">{stats?.pending || 0}</div>
              </div>
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <FeedbackDashboard projects={projects} />
    </div>
  );
}