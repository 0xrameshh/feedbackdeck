'use client';

import { useState } from 'react';
import type { Project } from "@/db/schema";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Globe, Code } from "lucide-react";

interface CreateProjectFormProps {
  onSuccess?: (project: Project) => void;
}

export function CreateProjectForm({ onSuccess }: CreateProjectFormProps) {
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [embedCode, setEmbedCode] = useState('');
  const [showEmbed, setShowEmbed] = useState(false);
  
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !domain) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          domain
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create project');
      }

      const data = await response.json();
      
      setEmbedCode(data.embedCode);
      setShowEmbed(true);
      toast.success('Project created successfully!');
      
      if (onSuccess) {
        onSuccess(data.project);
      }
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode);
    toast.success('Embed code copied to clipboard!');
  };

  if (showEmbed) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Your Embed Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Copy this code and paste it before the closing &lt;/body&gt; tag on your website:
          </p>
          <div className="bg-gray-100 p-4 rounded-md">
            <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
              {embedCode}
            </pre>
          </div>
          <div className="flex gap-2">
            <Button onClick={copyEmbedCode} variant="outline">
              Copy Code
            </Button>
            <Button 
              onClick={() => {
                setShowEmbed(false);
                setName('');
                setDomain('');
                setEmbedCode('');
                router.refresh();
              }}
            >
              Create Another Project
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Project Name</Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Awesome Website"
          required
        />
      </div>

      <div>
        <Label htmlFor="domain">Website Domain</Label>
        <div className="relative">
          <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="domain"
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="example.com or localhost:3001"
            className="pl-10"
            required
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Enter your domain without http:// or https://. You can use localhost for testing.
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Project'}
      </Button>
    </form>
  );
}