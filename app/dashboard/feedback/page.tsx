'use client';

import { useEffect, useState } from 'react';
import { FeedbackDashboard } from "@/components/feedback-dashboard";
import type { Project } from "@/db/schema";

export default function FeedbackPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
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
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded mb-6 w-1/4"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Feedback</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          View and manage all feedback from your websites
        </p>
      </div>

      {/* Main Dashboard */}
      <FeedbackDashboard projects={projects} />
    </div>
  );
}