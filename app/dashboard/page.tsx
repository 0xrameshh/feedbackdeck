'use client';

import { CreateProjectForm } from "@/components/forms/create-project-form";
import { ProjectsList } from "@/components/projects-list";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Globe, BarChart3, MessageSquare, Plus, Clock } from "lucide-react";
import type { Project } from "@/db/schema";

interface DashboardStats {
  totalFeedback: number;
  pending: number;
  responded: number;
  thisWeek: number;
  responseRate: number;
  activeSites: number;
  weeklyData: number[];
  categoryData: {
    general: number;
    bug: number;
    feature: number;
    praise: number;
  };
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  // const [loading, setLoading] = useState(true); // Currently unused

  const fetchProjects = useCallback(async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        // Fallback to default stats
        setStats({
          totalFeedback: 0,
          pending: 0,
          responded: 0,
          thisWeek: 0,
          responseRate: 0,
          activeSites: projects.length,
          weeklyData: [0, 0, 0, 0, 0, 0, 0],
          categoryData: { general: 0, bug: 0, feature: 0, praise: 0 }
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Fallback to default stats
      setStats({
        totalFeedback: 0,
        pending: 0,
        responded: 0,
        thisWeek: 0,
        responseRate: 0,
        activeSites: projects.length,
        weeklyData: [0, 0, 0, 0, 0, 0, 0],
        categoryData: { general: 0, bug: 0, feature: 0, praise: 0 }
      });
    } finally {
      // setLoading(false); // Loading state currently unused
    }
  }, [projects]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (projects.length >= 0) { // Fetch stats even if no projects (for 0 stats)
      fetchStats();
    }
  }, [projects, fetchStats]);

  // const hasProjects = projects.length > 0; // Currently unused
  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back</h1>
          <p className="text-gray-600 text-sm sm:text-base">Here&apos;s what&apos;s happening with your feedback collection today</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Add a website to start collecting feedback from your users.
              </DialogDescription>
            </DialogHeader>
            <CreateProjectForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Key Stats */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-6 sm:mb-8">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Feedback</p>
                <div className="text-2xl sm:text-3xl font-bold">{stats?.totalFeedback || 0}</div>
              </div>
              <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Pending</p>
                <div className="text-2xl sm:text-3xl font-bold text-orange-600">{stats?.pending || 0}</div>
              </div>
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Active Sites</p>
                <div className="text-2xl sm:text-3xl font-bold text-green-600">{stats?.activeSites || 0}</div>
              </div>
              <Globe className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 mb-6 sm:mb-8">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm sm:text-base">Recent Feedback</h3>
              <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            </div>
            <Button asChild variant="outline" className="w-full text-sm">
              <Link href="/dashboard/feedback">
                Manage Feedback
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm sm:text-base">Analytics</h3>
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            </div>
            <Button asChild variant="outline" className="w-full text-sm">
              <Link href="/dashboard/analytics">
                View Reports
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Projects Section */}
      <Card id="projects">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-lg sm:text-xl">Your Projects</CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="w-full sm:w-auto text-sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Project
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>
                    Add a website to start collecting feedback from your users.
                  </DialogDescription>
                </DialogHeader>
                <CreateProjectForm />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <ProjectsList />
        </CardContent>
      </Card>
    </div>
  );
}