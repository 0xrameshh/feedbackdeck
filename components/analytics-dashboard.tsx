'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, 
  TrendingUp, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  Users,
  Globe,
  ExternalLink
} from "lucide-react";
import type { Project, FeedbackCategory } from "@/db/schema";

interface AnalyticsData {
  totalFeedback: number;
  unreadCount: number;
  categories: Record<FeedbackCategory, number>;
  trends: Array<{ date: string; count: number }>;
  topPages: Array<{ url: string; count: number }>;
  responseRate: number;
  projectStats?: Array<{
    projectId: string;
    projectName: string;
    projectDomain: string;
    feedbackCount: number;
  }>;
  period: number;
}

interface AnalyticsDashboardProps {
  projects: Project[];
}

export function AnalyticsDashboard({ projects }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        period: selectedPeriod
      });

      if (selectedProject && selectedProject !== 'all') {
        params.append('projectId', selectedProject);
      }

      const response = await fetch(`/api/analytics?${params}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedProject, selectedPeriod]); // fetchAnalytics is stable

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return <div>Failed to load analytics</div>;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const categoryEmojis = {
    general: '💬',
    bug: '🐛',
    feature: '✨',
    praise: '🎉'
  };


  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Time Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalFeedback}</div>
            <p className="text-xs text-muted-foreground">
              Last {analytics.period} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{analytics.unreadCount}</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analytics.responseRate}%</div>
            <p className="text-xs text-muted-foreground">
              Replied to feedback
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedProject && selectedProject !== 'all' ? 1 : projects.length}</div>
            <p className="text-xs text-muted-foreground">
              Active projects
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Feedback Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analytics.categories).map(([category, count]) => {
                const percentage = analytics.totalFeedback > 0 
                  ? Math.round((count / analytics.totalFeedback) * 100) 
                  : 0;
                
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{categoryEmojis[category as FeedbackCategory]}</span>
                        <span className="text-sm font-medium capitalize">{category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{count}</span>
                        <span className="text-xs text-gray-500">({percentage}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Daily Trends (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.trends.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-7 gap-2">
                  {analytics.trends.map((trend, index) => {
                    const maxCount = Math.max(...analytics.trends.map(t => t.count));
                    const height = maxCount > 0 ? (trend.count / maxCount) * 100 : 0;
                    
                    return (
                      <div key={index} className="flex flex-col items-center gap-2">
                        <div className="text-xs text-gray-600">{trend.count}</div>
                        <div 
                          className="w-full bg-blue-500 rounded-t"
                          style={{ height: `${height}px`, minHeight: '4px' }}
                        ></div>
                        <div className="text-xs text-gray-500">
                          {formatDate(trend.date)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No data available for the selected period</p>
            )}
          </CardContent>
        </Card>

        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Top Pages by Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.topPages.length > 0 ? (
              <div className="space-y-3">
                {analytics.topPages.slice(0, 5).map((page, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <a 
                        href={page.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1 truncate"
                      >
                        {new URL(page.url).pathname}
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{page.count}</span>
                      <span className="text-xs text-gray-500">feedback</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No feedback data available</p>
            )}
          </CardContent>
        </Card>

        {/* Project Stats (only when viewing all projects) */}
        {(!selectedProject || selectedProject === 'all') && analytics.projectStats && analytics.projectStats.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Project Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.projectStats.map((project) => (
                  <div key={project.projectId} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">{project.projectName}</div>
                      <div className="text-xs text-gray-500">{project.projectDomain}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{project.feedbackCount}</span>
                      <span className="text-xs text-gray-500">feedback</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}