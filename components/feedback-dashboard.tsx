'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Search, Filter, ExternalLink, Calendar, Globe, Mail, Trash2, Reply, Send } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Feedback, Project, FeedbackCategory, FeedbackStatus } from "@/db/schema";

interface FeedbackWithProject extends Omit<Feedback, 'createdAt'> {
  projectName: string;
  projectDomain: string;
  createdAt: string;
}

interface FeedbackData {
  feedback: FeedbackWithProject[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

interface FeedbackDashboardProps {
  projects: Project[];
}

export function FeedbackDashboard({ projects }: FeedbackDashboardProps) {
  const [feedbackData, setFeedbackData] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackWithProject | null>(null);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [sendingResponse, setSendingResponse] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchFeedback = async (page = 1, reset = false) => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });

      if (selectedProject && selectedProject !== 'all') params.append('projectId', selectedProject);
      if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedStatus && selectedStatus !== 'all') params.append('status', selectedStatus);

      const response = await fetch(`/api/feedback?${params}`);
      if (!response.ok) throw new Error('Failed to fetch feedback');
      
      const data: FeedbackData = await response.json();
      
      if (reset || page === 1) {
        setFeedbackData(data);
      } else {
        // Append to existing data for pagination
        setFeedbackData(prev => prev ? {
          ...data,
          feedback: [...prev.feedback, ...data.feedback]
        } : data);
      }
      
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback(1, true);
  }, [selectedProject, selectedCategory, selectedStatus]); // fetchFeedback is stable

  const filteredFeedback = useMemo(() => {
    if (!feedbackData || !searchTerm) return feedbackData?.feedback || [];
    
    return feedbackData.feedback.filter(item =>
      item.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [feedbackData, searchTerm]);

  const updateFeedbackStatus = async (feedbackId: string, status: FeedbackStatus) => {
    try {
      const response = await fetch(`/api/feedback/${feedbackId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (!response.ok) throw new Error('Failed to update status');

      // Update local state
      setFeedbackData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          feedback: prev.feedback.map(item =>
            item.id === feedbackId ? { ...item, status } : item
          )
        };
      });

      toast.success('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const sendResponse = async () => {
    if (!selectedFeedback || !responseText.trim()) return;

    setSendingResponse(true);
    try {
      const response = await fetch(`/api/feedback/${selectedFeedback.id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: responseText.trim() })
      });

      if (!response.ok) throw new Error('Failed to send response');

      // Update feedback status in local state
      setFeedbackData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          feedback: prev.feedback.map(item =>
            item.id === selectedFeedback.id ? { ...item, status: 'responded' as const } : item
          )
        };
      });

      // Update selected feedback
      setSelectedFeedback(prev => 
        prev ? { ...prev, status: 'responded' as const } : prev
      );

      setResponseText('');
      setShowResponseForm(false);
      toast.success('Response sent successfully');
    } catch (error) {
      console.error('Error sending response:', error);
      toast.error('Failed to send response');
    } finally {
      setSendingResponse(false);
    }
  };

  const deleteFeedback = async (feedbackId: string) => {
    if (!confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/feedback/${feedbackId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete feedback');

      // Remove from local state
      setFeedbackData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          feedback: prev.feedback.filter(item => item.id !== feedbackId),
          total: prev.total - 1
        };
      });

      setSelectedFeedback(null);
      toast.success('Feedback deleted successfully');
    } catch (error) {
      console.error('Error deleting feedback:', error);
      toast.error('Failed to delete feedback');
    }
  };

  const getCategoryColor = (category: FeedbackCategory): string => {
    const colors = {
      general: 'bg-blue-100 text-blue-800',
      bug: 'bg-red-100 text-red-800',
      feature: 'bg-green-100 text-green-800',
      praise: 'bg-purple-100 text-purple-800'
    };
    return colors[category];
  };

  const getStatusColor = (status: FeedbackStatus): string => {
    const colors = {
      unread: 'bg-yellow-100 text-yellow-800',
      read: 'bg-blue-100 text-blue-800',
      responded: 'bg-green-100 text-green-800',
      archived: 'bg-gray-100 text-gray-800'
    };
    return colors[status];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && !feedbackData) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search feedback..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-[180px]">
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

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="bug">Bug Report</SelectItem>
                <SelectItem value="feature">Feature Request</SelectItem>
                <SelectItem value="praise">Praise</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="responded">Responded</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Feedback List */}
      <div className="space-y-4">
        {filteredFeedback.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">No feedback yet</h3>
              <p className="text-gray-600">
                Feedback submissions will appear here once users start using your widget.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {filteredFeedback.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Badge className={getCategoryColor(item.category)}>
                        {item.category}
                      </Badge>
                      <Badge className={getStatusColor(item.status || 'unread')}>
                        {item.status || 'unread'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedFeedback(item)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-sm font-medium text-gray-900">
                      {item.message}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {item.projectName}
                      </span>
                      {item.userEmail && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {item.userEmail}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {item.status === 'unread' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateFeedbackStatus(item.id, 'read')}
                        >
                          Mark as Read
                        </Button>
                      )}
                      {item.userEmail && item.status !== 'responded' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedFeedback(item);
                            setShowResponseForm(true);
                          }}
                          className="flex items-center gap-1"
                        >
                          <Reply className="h-3 w-3" />
                          Reply
                        </Button>
                      )}
                      {item.status !== 'archived' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateFeedbackStatus(item.id, 'archived')}
                        >
                          Archive
                        </Button>
                      )}
                    </div>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(item.pageUrl, '_blank')}
                      className="flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View Page
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Load More Button */}
            {feedbackData?.hasMore && (
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={() => fetchFeedback(currentPage + 1)}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Feedback Detail Modal */}
      <Dialog open={!!selectedFeedback && !showResponseForm} onOpenChange={() => setSelectedFeedback(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Feedback Details</span>
              <div className="flex gap-2">
                <Badge className={getCategoryColor(selectedFeedback?.category as FeedbackCategory)}>
                  {selectedFeedback?.category}
                </Badge>
                <Badge className={getStatusColor(selectedFeedback?.status as FeedbackStatus)}>
                  {selectedFeedback?.status}
                </Badge>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {selectedFeedback && (
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Message</h4>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                  {selectedFeedback.message}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Project</h4>
                  <p className="text-sm text-gray-600">
                    {selectedFeedback.projectName} ({selectedFeedback.projectDomain})
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Date</h4>
                  <p className="text-sm text-gray-600">
                    {formatDate(selectedFeedback.createdAt)}
                  </p>
                </div>

                {selectedFeedback.userEmail && (
                  <div>
                    <h4 className="font-semibold mb-2">Email</h4>
                    <p className="text-sm text-gray-600">{selectedFeedback.userEmail}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold mb-2">Page URL</h4>
                  <a 
                    href={selectedFeedback.pageUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {selectedFeedback.pageUrl}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              {selectedFeedback.metadata && Object.keys(selectedFeedback.metadata).length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Additional Information</h4>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <pre className="text-xs text-gray-600">
                      {JSON.stringify(selectedFeedback.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t">
                {selectedFeedback.status === 'unread' && (
                  <Button
                    onClick={() => updateFeedbackStatus(selectedFeedback.id, 'read')}
                    variant="outline"
                  >
                    Mark as Read
                  </Button>
                )}
                {selectedFeedback.userEmail && selectedFeedback.status !== 'responded' && (
                  <Button
                    onClick={() => setShowResponseForm(true)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Reply className="h-4 w-4" />
                    Send Reply
                  </Button>
                )}
                {selectedFeedback.status !== 'archived' && (
                  <Button
                    onClick={() => updateFeedbackStatus(selectedFeedback.id, 'archived')}
                    variant="outline"
                  >
                    Archive
                  </Button>
                )}
                <Button
                  onClick={() => deleteFeedback(selectedFeedback.id)}
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Response Form Modal */}
      <Dialog open={showResponseForm} onOpenChange={(open) => {
        if (!open) {
          setShowResponseForm(false);
          setResponseText('');
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Reply className="h-5 w-5" />
              Send Reply to User
            </DialogTitle>
          </DialogHeader>
          
          {selectedFeedback && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium mb-2">Original Feedback</h4>
                <p className="text-sm text-gray-700 mb-2">&quot;{selectedFeedback.message}&quot;</p>
                <p className="text-xs text-gray-500">
                  From: {selectedFeedback.userEmail} • {formatDate(selectedFeedback.createdAt)}
                </p>
              </div>

              <div>
                <label htmlFor="response-message" className="block text-sm font-medium mb-2">
                  Your Response
                </label>
                <Textarea
                  id="response-message"
                  placeholder="Write your response to the user..."
                  value={responseText}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setResponseText(e.target.value)}
                  rows={6}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will be sent to {selectedFeedback.userEmail}
                </p>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowResponseForm(false);
                    setResponseText('');
                  }}
                  disabled={sendingResponse}
                >
                  Cancel
                </Button>
                <Button
                  onClick={sendResponse}
                  disabled={sendingResponse || !responseText.trim()}
                  className="flex items-center gap-2"
                >
                  {sendingResponse ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Reply
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}