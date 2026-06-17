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

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Monitor your feedback collection and manage projects</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button asChild variant="outline" className="flex-1 sm:flex-none">
            <Link href="/dashboard/feedback">
              <MessageSquare className="h-4 w-4 mr-2" />
              View Feedback
            </Link>
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex-1 sm:flex-none">
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
      </div>

      {/* Key Stats - Simplified */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
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
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Unread</p>
                <div className="text-2xl sm:text-3xl font-bold text-orange-600 dark:text-orange-400">{stats?.pending || 0}</div>
              </div>
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Active Projects</p>
                <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">{stats?.activeSites || 0}</div>
              </div>
              <Globe className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">This Week</p>
                <div className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">{stats?.thisWeek || 0}</div>
              </div>
              <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Section */}
      <Card id="projects">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Your Projects</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <ProjectsList />
        </CardContent>
      </Card>
    </div>
  );
}