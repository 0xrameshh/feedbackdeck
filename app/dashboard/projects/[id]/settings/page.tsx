'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowLeft, Save, Palette, Eye } from "lucide-react";
import Link from "next/link";

interface Project {
  id: string;
  name: string;
  domain: string;
  widgetSettings: {
    triggerText?: string;
    primaryColor?: string;
    textColor?: string;
    showRating?: boolean;
    customCSS?: string;
  };
}

export default function ProjectSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<{
    triggerText: string;
    primaryColor: string;
    textColor: string;
    showRating: boolean;
    customCSS: string;
  }>({
    triggerText: 'Feedback',
    primaryColor: '#3b82f6',
    textColor: '#1f2937',
    showRating: true,
    customCSS: ''
  });

  const fetchProject = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) throw new Error('Failed to fetch project');
      
      const data = await response.json();
      setProject(data.project);

      setSettings(prev => ({
        ...prev,
        ...data.project.widgetSettings
      }));
    } catch (error) {
      console.error('Error fetching project:', error);
      toast.error('Failed to load project');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [projectId, router]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          widgetSettings: settings
        })
      });

      if (!response.ok) throw new Error('Failed to save settings');

      toast.success('Widget settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const generatePreviewCode = () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return `<script
  defer
  data-project-id="${projectId}"
  src="${baseUrl}/widget/widget.js"></script>`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-1/4"></div>
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Widget Settings</h1>
          <p className="text-gray-600">{project.name}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="triggerText">Button Text</Label>
              <Input
                id="triggerText"
                value={settings.triggerText}
                onChange={(e) => setSettings(prev => ({ ...prev, triggerText: e.target.value }))}
                placeholder="Feedback"
              />
            </div>


            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <Input
                id="primaryColor"
                type="color"
                value={settings.primaryColor}
                onChange={(e) => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                onPaste={(e) => {
                  e.preventDefault();
                  const paste = e.clipboardData.getData('text');
                  if (paste.match(/^#[0-9A-Fa-f]{6}$/)) {
                    setSettings(prev => ({ ...prev, primaryColor: paste }));
                  }
                }}
              />
            </div>


          </CardContent>
        </Card>

        {/* Behavior Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Behavior
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="showRating">Enable Star Ratings</Label>
              <Switch
                id="showRating"
                checked={settings.showRating}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showRating: checked }))}
              />
            </div>


          </CardContent>
        </Card>

        {/* Embed Code */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Embed Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 p-4 rounded-md">
              <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                {generatePreviewCode()}
              </pre>
            </div>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(generatePreviewCode());
                toast.success('Embed code copied to clipboard!');
              }}
            >
              Copy Code
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
