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
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Copy this code and paste it before the closing &lt;/body&gt; tag on your website:
          </p>
          <div className="bg-muted p-4 rounded-lg border">
            <pre className="text-xs overflow-x-auto whitespace-pre-wrap text-foreground">
              {embedCode}
            </pre>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={copyEmbedCode} variant="outline" className="flex-1 sm:flex-none">
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
              className="flex-1 sm:flex-none"
            >
              Create Another Project
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-foreground">
            Project Name
          </Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Awesome Website"
            className="h-11"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="domain" className="text-sm font-medium text-foreground">
            Website Domain
          </Label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="domain"
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              className="pl-10 h-11"
              required
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            Enter your domain without http:// or https://
          </p>
        </div>

        <Button type="submit" className="w-full h-11 text-sm font-medium" disabled={isLoading}>
          {isLoading ? 'Creating Project...' : 'Create Project'}
        </Button>
      </form>
    </div>
  );
}