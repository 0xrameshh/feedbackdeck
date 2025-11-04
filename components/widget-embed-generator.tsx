"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Code2, Palette } from "lucide-react";

interface EmbedGeneratorProps {
  projectId: string;
  apiKey: string; // retained for compatibility; not required in embed anymore
}

export function WidgetEmbedGenerator({ projectId }: EmbedGeneratorProps) {
  const [customColor, setCustomColor] = useState("#2563eb");
  const [triggerText, setTriggerText] = useState("Feedback");
  const [copied, setCopied] = useState(false);

  const escapeAttr = (s: string) => s.replace(/"/g, '&quot;');

  const generateEmbedCode = () => {
    const base = process.env.NODE_ENV === 'production' ? 'https://feedbackstar.com' : 'http://localhost:3000';
    return `<!-- FeedbackStar Widget -->\n<script async data-project-id="${escapeAttr(projectId)}" data-trigger-text="${escapeAttr(triggerText)}" data-primary-color="${escapeAttr(customColor)}" src="${base}/js/script.js"></script>`;
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
            <Label htmlFor="trigger-text" className="text-sm font-medium">
              Button Text
            </Label>
            <Input
              id="trigger-text"
              value={triggerText}
              onChange={(e) => setTriggerText(e.target.value)}
              placeholder="Feedback"
            />
          </div>

          <div className="md:col-span-2">
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
            <div className="absolute bottom-4 right-20 text-xs text-muted-foreground">{triggerText}</div>
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
          
          <Textarea
            value={generateEmbedCode()}
            disabled={true}
            className="font-mono text-sm bg-gray-50 min-h-[200px] resize-none"
          />
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Installation Instructions</h4>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Copy the embed code above</li>
            <li>Paste it before the closing <code>&lt;/body&gt;</code> tag in your HTML</li>
            <li>The widget will automatically appear in the bottom-right corner</li>
            <li>Customize the color and settings from your dashboard</li>
          </ol>
        </div>

        {/* Framework Specific Instructions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="font-medium mb-2">React/Next.js</h5>
            <p className="text-gray-600">
              Add the script to your <code>_document.js</code> or use the component directly in your app.
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="font-medium mb-2">WordPress</h5>
            <p className="text-gray-600">
              Add to your theme&apos;s <code>footer.php</code> or use a custom HTML block.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
