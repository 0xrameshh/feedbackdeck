"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Code2, Palette } from "lucide-react";

interface EmbedGeneratorProps {
  projectId: string;
  apiKey: string;
}

export function WidgetEmbedGenerator({ projectId, apiKey }: EmbedGeneratorProps) {
  const [customColor, setCustomColor] = useState("#2563eb");
  const [copied, setCopied] = useState(false);

  const generateEmbedCode = () => {
    return `<!-- FeedbackStar Widget -->
<script>
  (function() {
    // Create widget container
    const widgetContainer = document.createElement('div');
    widgetContainer.id = 'feedbackstar-widget';
    document.body.appendChild(widgetContainer);

    // Widget configuration
    window.FeedbackStarConfig = {
      projectId: '${projectId}',
      apiKey: '${apiKey}',
      customColor: '${customColor}',
      apiUrl: '${process.env.NODE_ENV === 'production' ? 'https://feedbackstar.com' : 'http://localhost:3001'}/api/feedback'
    };

    // Load widget script
    const script = document.createElement('script');
    script.src = '${process.env.NODE_ENV === 'production' ? 'https://feedbackstar.com' : 'http://localhost:3001'}/widget.js';
    script.async = true;
    script.onload = function() {
      if (window.FeedbackStar) {
        window.FeedbackStar.init(window.FeedbackStarConfig);
      }
    };
    document.head.appendChild(script);

    // Load widget styles
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '${process.env.NODE_ENV === 'production' ? 'https://feedbackstar.com' : 'http://localhost:3001'}/widget.css';
    document.head.appendChild(link);
  })();
</script>`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateEmbedCode());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Code2 className="h-5 w-5 text-blue-600" />
          <CardTitle>Widget Embed Code</CardTitle>
        </div>
        <CardDescription>
          Copy and paste this code into your website&apos;s HTML to add the feedback widget
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Customization Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="project-id" className="text-sm font-medium">
              Project ID
            </Label>
            <Input
              id="project-id"
              value={projectId}
              readOnly
              className="bg-gray-50 text-gray-600"
            />
          </div>
          
          <div>
            <Label htmlFor="widget-color" className="text-sm font-medium flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Widget Color
            </Label>
            <div className="flex gap-2">
              <Input
                id="widget-color"
                type="color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="w-16 h-10 p-1 border rounded cursor-pointer"
              />
              <Input
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                placeholder="#2563eb"
                className="flex-1"
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Preview</Label>
          <div className="relative bg-gray-100 rounded-lg p-4 h-32 overflow-hidden">
            <div className="absolute bottom-4 right-4">
              <div 
                className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white"
                style={{ backgroundColor: customColor }}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 6h-2l-1-2H6L5 6H3c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM12 17c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5z"/>
                </svg>
              </div>
            </div>
            <Badge className="absolute top-2 left-2" variant="secondary">
              Your website content here
            </Badge>
          </div>
        </div>

        {/* Embed Code */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Embed Code</Label>
            <Button
              onClick={copyToClipboard}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-green-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Code
                </>
              )}
            </Button>
          </div>
          <div className="bg-gray-100 p-4 rounded-md">
            <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
              {generateEmbedCode()}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
