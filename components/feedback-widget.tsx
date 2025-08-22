"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { X, Star, Send, Smile, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FeedbackWidgetProps {
  projectId?: string;
  apiKey?: string;
  customColor?: string;
}

const FEEDBACK_TYPES = [
  { type: "star", icon: Star, label: "Star Rating" },
  { type: "emoji", icon: Smile, label: "Emoji" },
  { type: "thumbs", icon: ThumbsUp, label: "Thumbs Up/Down" },
];

export function FeedbackWidget({ 
  projectId = "demo"
}: FeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Feedback state
  const [feedbackType, setFeedbackType] = useState("star");
  const [rating, setRating] = useState(0);
  const [emoji, setEmoji] = useState("");
  const [thumb, setThumb] = useState("");
  const [comment, setComment] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Here you would typically send to your API
      console.log({
        projectId,
        feedbackType,
        rating,
        emoji,
        thumb,
        comment,
        email,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      });

      setIsSubmitted(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setIsOpen(false);
        setFeedbackType("star");
        setRating(0);
        setEmoji("");
        setThumb("");
        setComment("");
        setEmail("");
      }, 3000);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsSubmitted(false);
    setFeedbackType("star");
    setRating(0);
    setEmoji("");
    setThumb("");
    setComment("");
    setEmail("");
  };

  return (
    <>
      {/* Widget Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-16 w-16 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-110 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 border-0 ring-2 ring-white/20"
          aria-label="Open feedback widget"
        >
          <MessageSquare className="h-8 w-8" />
        </Button>
      </div>

      {/* Feedback Modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-gradient-to-br from-black/30 via-blue-900/20 to-purple-900/30 backdrop-blur-sm z-40 transition-all duration-300"
            onClick={handleClose}
          />
          
          {/* Widget Card */}
          <div className="fixed bottom-24 right-6 z-50 w-80 max-w-[calc(100vw-3rem)] animate-in slide-in-from-bottom-8 slide-in-from-right-8 duration-500">
            <Card className="shadow-2xl border-0 rounded-xl overflow-hidden bg-white dark:bg-gray-900">
              {/* Header */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  <span className="font-semibold">Share Feedback</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="h-8 w-8 p-0 text-white hover:bg-white/20 rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <CardContent className="p-6">
                {isSubmitted ? (
                  /* Success State */
                  <div className="text-center py-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-green-600 font-semibold">
                      Thank you for your feedback!
                    </span>
                  </div>
                ) : (
                  /* Feedback Form */
                  <div className="flex flex-col gap-4">
                    {/* Feedback Type Selection */}
                    <div className="flex flex-col gap-2">
                      <span className="font-semibold text-sm">
                        How was your experience?
                      </span>
                      <div className="flex gap-2">
                        {FEEDBACK_TYPES.map((ft) => (
                          <Button
                            key={ft.type}
                            size="sm"
                            variant={feedbackType === ft.type ? "secondary" : "ghost"}
                            onClick={() => setFeedbackType(ft.type)}
                            className="flex items-center gap-1"
                          >
                            <ft.icon className="w-4 h-4" />
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Rating Type Content */}
                    {feedbackType === "star" && (
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            className={`text-yellow-400 ${
                              n <= rating ? "" : "opacity-30"
                            } transition-all hover:scale-110`}
                            onClick={() => setRating(n)}
                          >
                            <Star
                              className="w-6 h-6"
                              fill={n <= rating ? "#facc15" : "none"}
                            />
                          </button>
                        ))}
                      </div>
                    )}

                    {feedbackType === "emoji" && (
                      <div className="flex gap-2">
                        {[
                          { e: "😊", label: "Happy" },
                          { e: "😐", label: "Neutral" },
                          { e: "😞", label: "Unhappy" },
                        ].map((em) => (
                          <button
                            key={em.e}
                            type="button"
                            className={`text-2xl p-2 rounded-full transition-all hover:scale-110 ${
                              emoji === em.e ? "ring-2 ring-blue-500" : ""
                            }`}
                            onClick={() => setEmoji(em.e)}
                          >
                            {em.e}
                          </button>
                        ))}
                      </div>
                    )}

                    {feedbackType === "thumbs" && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className={`p-2 rounded-full border transition-all ${
                            thumb === "up"
                              ? "bg-green-100 border-green-400"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setThumb("up")}
                        >
                          <ThumbsUp className="w-5 h-5 text-green-600" />
                        </button>
                        <button
                          type="button"
                          className={`p-2 rounded-full border transition-all ${
                            thumb === "down"
                              ? "bg-red-100 border-red-400"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setThumb("down")}
                        >
                          <ThumbsDown className="w-5 h-5 text-red-600" />
                        </button>
                      </div>
                    )}

                    {/* Comment */}
                    <Textarea
                      placeholder="Additional comments (optional)"
                      value={comment}
                      onChange={(value) => setComment(value || "")}
                      className="text-sm min-h-[60px]"
                    />

                    {/* Email */}
                    <Input
                      type="email"
                      placeholder="Email (optional)"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="text-sm"
                    />

                    {/* Submit Button */}
                    <Button
                      onClick={handleSubmit}
                      disabled={
                        (feedbackType === "star" && rating === 0) ||
                        (feedbackType === "emoji" && !emoji) ||
                        (feedbackType === "thumbs" && !thumb) ||
                        isSubmitting
                      }
                      className="self-end bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Submit Feedback
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Branding */}
                <div className="flex items-center justify-center text-xs text-gray-400 mt-4 pt-3 border-t">
                  <span>Powered by</span>
                  <Badge className="ml-1 text-xs bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 px-2 py-0.5">
                    ⭐ FeedbackStar
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </>
  );
}