'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Search, Filter, ExternalLink, Calendar, Globe, Mail, Trash2, Reply, Star } from "lucide-react";
import { toast } from "sonner";
import { flag } from "country-emoji";
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
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Check URL parameters for initial project filter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('projectId');
    if (projectId && projects.some(p => p.id === projectId)) {
      setSelectedProject(projectId);
    }
  }, [projects]);

  const fetchFeedback = useCallback(async (page = 1, reset = false) => {
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
  }, [selectedProject, selectedCategory, selectedStatus]);

  useEffect(() => {
    fetchFeedback(1, true);
  }, [selectedProject, selectedCategory, selectedStatus, fetchFeedback]); // fetchFeedback is stable

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

      if (!response.ok) {
        const errorData = await response.text();
        console.error('API Error:', errorData);
        throw new Error(`Failed to update status: ${response.status}`);
      }

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

      // Update selected feedback if it matches
      if (selectedFeedback?.id === feedbackId) {
        setSelectedFeedback(prev => prev ? { ...prev, status } : null);
      }

      toast.success('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const openEmailReply = (feedback: FeedbackWithProject) => {
    const subject = encodeURIComponent(`Re: Your feedback on ${feedback.projectName}`);
    const body = encodeURIComponent(
      `Hi,

Thank you for your feedback on ${feedback.projectName}. 

Your original message:
"${feedback.message}"

[Write your response here]

Best regards,
Your Team

---
This is in response to feedback submitted on ${formatDate(feedback.createdAt)} from ${feedback.pageUrl}`
    );
    
    const mailtoUrl = `mailto:${feedback.userEmail}?subject=${subject}&body=${body}`;
    window.open(mailtoUrl, '_blank');
    
    // Mark as responded
    updateFeedbackStatus(feedback.id, 'responded');
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
      archived: 'bg-gray-100 text-gray-800' // Keep for backward compatibility with existing data
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

  const renderStarRating = (rating: number | null) => {
    if (!rating) return null;
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 sm:h-4 sm:w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 ml-1">({rating}/5)</span>
      </div>
    );
  };

  // Get flag emoji for country using country-emoji library
  const getCountryFlag = (countryName: string): string => {
    try {
      const flagEmoji = flag(countryName);
      return flagEmoji || '🌍';
    } catch {
      return '🌍';
    }
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
    <div className="space-y-4 sm:space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row flex-wrap gap-4">
            <div className="flex-1 min-w-full sm:min-w-[200px]">
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
              <SelectTrigger className="w-full sm:w-[180px]">
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
              <SelectTrigger className="w-full sm:w-[150px]">
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
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="responded">Responded</SelectItem>
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
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">No feedback yet</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Feedback submissions will appear here once users start using your widget.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {filteredFeedback.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4 sm:pt-6 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={getCategoryColor(item.category)}>
                        {item.category}
                      </Badge>
                      <Badge className={getStatusColor(item.status || 'unread')}>
                        {item.status || 'unread'}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Message and Rating */}
                    <div className="flex items-start gap-2">
                      <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100">
                        {item.message}
                      </p>
                      {item.rating && (
                        <div className="flex-shrink-0">
                          {renderStarRating(item.rating)}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons - All on same line */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedFeedback(item)}
                        className="text-xs sm:text-sm"
                      >
                        View Details
                      </Button>
                      {item.status === 'unread' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateFeedbackStatus(item.id, 'read')}
                          className="text-xs sm:text-sm"
                        >
                          Mark as Read
                        </Button>
                      )}
                      {item.userEmail && item.status !== 'responded' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEmailReply(item)}
                          className="flex items-center gap-1 text-xs sm:text-sm"
                        >
                          <Reply className="h-3 w-3 sm:h-4 sm:w-4" />
                          Reply
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Metadata Section - Below the main content */}
                  {(item.metadata?.country || item.metadata?.device || item.metadata?.os || 
                    item.metadata?.browserInfo || item.metadata?.language || item.metadata?.timezone || 
                    item.metadata?.screenResolution || item.metadata?.route) && (
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
                        {item.metadata?.country && (
                          <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded flex items-center gap-1">
                            <span className="text-sm sm:text-base">{getCountryFlag(item.metadata.country)}</span>
                            <span>{item.metadata.country}</span>
                          </span>
                        )}
                        {item.metadata?.device && (
                          <span className="bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
                            💻 {item.metadata.device}
                          </span>
                        )}
                        {item.metadata?.os && (
                          <span className="bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
                            🖥️ {item.metadata.os}
                          </span>
                        )}
                        {item.metadata?.browserInfo && (
                          <span className="bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded">
                            🌐 {item.metadata.browserInfo}
                          </span>
                        )}
                        {item.metadata?.language && (
                          <span className="bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded">
                            🗣️ {item.metadata.language}
                          </span>
                        )}
                        {item.metadata?.timezone && (
                          <span className="bg-pink-100 dark:bg-pink-900/30 px-2 py-1 rounded">
                            🕐 {item.metadata.timezone}
                          </span>
                        )}
                        {item.metadata?.screenResolution && (
                          <span className="bg-indigo-100 dark:bg-indigo-900/30 px-2 py-1 rounded">
                            📺 {item.metadata.screenResolution}
                          </span>
                        )}
                        {item.metadata?.route && (
                          <a 
                            href={item.pageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded inline-flex items-center gap-1 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {item.metadata.route}
                          </a>
                        )}
                      </div>
                    </div>
                  )}
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
      <Dialog open={!!selectedFeedback} onOpenChange={() => setSelectedFeedback(null)}>
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
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Message</h4>
                  {selectedFeedback.rating && (
                    <div className="ml-4">
                      {renderStarRating(selectedFeedback.rating)}
                    </div>
                  )}
                </div>
                <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                  {selectedFeedback.message}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Project</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedFeedback.projectName} ({selectedFeedback.projectDomain})
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Date</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(selectedFeedback.createdAt)}
                  </p>
                </div>

                {selectedFeedback.userEmail && (
                  <div>
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Email</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedFeedback.userEmail}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Page URL</h4>
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
                  <h4 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Technical Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {selectedFeedback.metadata.country && (
                      <div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">Country:</span>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-lg">{getCountryFlag(selectedFeedback.metadata.country)}</span>
                          <span className="text-gray-900 dark:text-gray-100">{selectedFeedback.metadata.country}</span>
                        </div>
                      </div>
                    )}
                    {selectedFeedback.metadata.browserInfo && (
                      <div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">Browser:</span>
                        <p className="text-gray-900 dark:text-gray-100">{selectedFeedback.metadata.browserInfo}</p>
                      </div>
                    )}
                    {selectedFeedback.metadata.os && (
                      <div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">OS:</span>
                        <p className="text-gray-900 dark:text-gray-100">{selectedFeedback.metadata.os}</p>
                      </div>
                    )}
                    {selectedFeedback.metadata.device && (
                      <div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">Device:</span>
                        <p className="text-gray-900 dark:text-gray-100">{selectedFeedback.metadata.device}</p>
                      </div>
                    )}
                    {selectedFeedback.metadata.screenResolution && (
                      <div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">Screen:</span>
                        <p className="text-gray-900 dark:text-gray-100">{selectedFeedback.metadata.screenResolution}</p>
                      </div>
                    )}
                    {selectedFeedback.metadata.route && (
                      <div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">Route:</span>
                        <p className="break-all text-gray-900 dark:text-gray-100">{selectedFeedback.metadata.route}</p>
                      </div>
                    )}
                    {selectedFeedback.metadata.language && (
                      <div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">Language:</span>
                        <p className="text-gray-900 dark:text-gray-100">{selectedFeedback.metadata.language}</p>
                      </div>
                    )}
                    {selectedFeedback.metadata.timezone && (
                      <div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">Timezone:</span>
                        <p className="text-gray-900 dark:text-gray-100">{selectedFeedback.metadata.timezone}</p>
                      </div>
                    )}
                    {selectedFeedback.metadata.referrer && (
                      <div className="col-span-2">
                        <span className="font-medium text-gray-600 dark:text-gray-400">Referrer:</span>
                        <p className="break-all text-gray-900 dark:text-gray-100">{selectedFeedback.metadata.referrer}</p>
                      </div>
                    )}
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
                    onClick={() => openEmailReply(selectedFeedback)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Reply className="h-4 w-4" />
                    Send Reply
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

    </div>
  );
}