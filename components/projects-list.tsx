'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, MessageSquare, Settings, Trash2, Code2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateProjectForm } from "./forms/create-project-form";
import type { Project } from "@/db/schema";

export function ProjectsList() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectFeedbackCounts, setProjectFeedbackCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [embedCode, setEmbedCode] = useState('');

  const fetchFeedbackCounts = useCallback(async (projectList: Project[]) => {
    try {
      const counts: Record<string, number> = {};
      
      for (const project of projectList) {
        const response = await fetch(`/api/feedback?projectId=${project.id}`);
        if (response.ok) {
          const data = await response.json();
          counts[project.id] = data.feedback?.length || 0;
        } else {
          counts[project.id] = 0;
        }
      }
      
      setProjectFeedbackCounts(counts);
    } catch (error) {
      console.error('Error fetching feedback counts:', error);
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) throw new Error('Failed to fetch projects');
      
      const data = await response.json();
      setProjects(data.projects);
      
      // Fetch feedback counts for each project
      if (data.projects && data.projects.length > 0) {
        await fetchFeedbackCounts(data.projects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [fetchFeedbackCounts]);


  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const deleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete project');
      
      setProjects(projects.filter(p => p.id !== projectId));
      toast.success('Project deleted successfully');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  const generateEmbedCode = (project: Project) => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const trig = project.widgetSettings?.triggerText || 'Feedback';
    const color = project.widgetSettings?.primaryColor || '#3b82f6';
    // Use data-* to avoid flash of defaults; mount as soon as body exists
    return `<script 
  async
  data-project-id="${project.id}"
  data-trigger-text="${trig}"
  data-primary-color="${color}"
  src="${baseUrl}/widget/widget.js"></script>`;
  };

  const showEmbedCode = (project: Project) => {
    setSelectedProject(project);
    setEmbedCode(generateEmbedCode(project));
  };

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode);
    toast.success('Embed code copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Globe className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first project to start collecting feedback.
          </p>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Create Your First Project</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Add a website to start collecting feedback from your users.
                </DialogDescription>
              </DialogHeader>
              <CreateProjectForm onSuccess={fetchProjects} />
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-sm sm:text-base truncate">{project.name}</span>
                </div>
                <Badge variant={project.isActive ? "default" : "secondary"} className="text-xs">
                  {project.isActive ? "Active" : "Inactive"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3">
                <div className="text-xs sm:text-sm text-muted-foreground">
                  <strong>Domain:</strong> <span className="break-all">{project.domain}</span>
                </div>
                
                <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                  <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  {projectFeedbackCounts[project.id] || 0} feedback messages
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  {(projectFeedbackCounts[project.id] || 0) > 0 && (
                    <Button
                      size="sm"
                      onClick={() => router.push(`/dashboard/feedback?projectId=${project.id}`)}
                      className="w-full text-xs sm:text-sm"
                    >
                      <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      View Feedback ({projectFeedbackCounts[project.id] || 0})
                    </Button>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => showEmbedCode(project)}
                      className="flex-1 text-xs sm:text-sm"
                    >
                      <Code2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Embed Code
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/dashboard/projects/${project.id}/settings`)}
                      className="flex-1 sm:flex-none"
                    >
                      <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteProject(project.id)}
                      className="text-red-600 hover:text-red-700 flex-1 sm:flex-none"
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Embed Code Dialog */}
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Embed Code for {selectedProject?.name}</DialogTitle>
            <DialogDescription>
              Copy this code and paste it before the closing &lt;/body&gt; tag on your website.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-100 p-4 rounded-md">
              <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                {embedCode}
              </pre>
            </div>
            <Button onClick={copyEmbedCode} variant="outline">
              Copy to Clipboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
