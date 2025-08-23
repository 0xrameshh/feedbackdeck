"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { X, Star, Send, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FeedbackStarLogo } from "@/components/feedbackstar-logo";
import { cn } from "@/lib/utils";

interface FeedbackWidgetProps {
  projectId?: string;
  apiKey?: string;
  customColor?: string;
}

export function FeedbackWidget({ 
  projectId = "demo"
}: FeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Feedback state
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      console.log({
        projectId,
        rating,
        comment,
        email,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      });

      setIsSubmitted(true);
      
      // Reset form after 2.5 seconds
      setTimeout(() => {
        handleClose();
      }, 2500);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    // Delay reset to allow exit animation
    setTimeout(() => {
      setIsSubmitted(false);
      setRating(0);
      setHoveredStar(0);
      setComment("");
      setEmail("");
      setIsSubmitting(false);
    }, 200);
  };

  const getStarDisplay = (index: number) => {
    return index <= (hoveredStar || rating);
  };

  return (
    <>
      {/* Widget Trigger Button - Much Better */}
      <div className="fixed bottom-0 right-5 z-50">
        <div className="relative group">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg scale-150 group-hover:bg-primary/30 transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
          
          <Button
            onClick={() => setIsOpen(true)}
            className={cn(
              "relative h-14 w-14 rounded-full shadow-lg hover:shadow-2xl",
              "transition-all duration-300 transform hover:scale-105 active:scale-95",
              "bg-primary hover:bg-primary/90",
              "border-2 border-white/10 hover:border-white/20",
              "backdrop-blur-sm"
            )}
            aria-label="Open feedback widget"
          >
            <FeedbackStarLogo 
              size={22} 
              className={cn(
                "brightness-0 invert transition-transform duration-300",
                "group-hover:scale-110"
              )} 
            />
          </Button>
        </div>
      </div>

      {/* Feedback Modal - Completely Reimagined */}
      {isOpen && (
        <>
          {/* Backdrop with smooth fade */}
          <div 
            className={cn(
              "fixed inset-0 z-40 transition-all duration-300 ease-out",
              "bg-black/50 backdrop-blur-sm",
              isOpen ? "opacity-100" : "opacity-0"
            )}
            onClick={handleClose}
          />
          
          {/* Widget Card - Smooth Spring Animation */}
          <div 
            className={cn(
              "fixed bottom-0 right-5 z-50 w-80 max-w-[calc(100vw-2.5rem)]",
              "transition-all duration-500 ease-out",
              "origin-bottom-right",
              isOpen 
                ? "opacity-100 scale-100 translate-y-0 translate-x-0" 
                : "opacity-0 scale-95 translate-y-4 translate-x-4"
            )}
            style={{
              transform: isOpen 
                ? "translateY(-4rem) scale(1)" 
                : "translateY(0) scale(0.95)",
              transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)"
            }}
          >
            <Card className={cn(
              "shadow-2xl border-0 overflow-hidden",
              "bg-background/98 backdrop-blur-xl",
              "ring-1 ring-black/5 dark:ring-white/10",
              "transform transition-all duration-300",
              "rounded-t-3xl rounded-bl-3xl rounded-br-none"
            )}>
              
              {/* Header - Enhanced with better radius */}
              <div className="relative overflow-hidden rounded-t-3xl">
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-primary/90 opacity-95"></div>
                <div className="relative flex items-center justify-between p-5 text-primary-foreground">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white/10 rounded-lg">
                      <FeedbackStarLogo size={16} className="brightness-0 invert" />
                    </div>
                    <h3 className="font-semibold text-base">Share Your Feedback</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    className={cn(
                      "h-8 w-8 p-0 rounded-full",
                      "text-primary-foreground/70 hover:text-primary-foreground",
                      "hover:bg-white/20 active:bg-white/25",
                      "transition-all duration-200 hover:scale-105 active:scale-95"
                    )}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <CardContent className="p-6">
                {isSubmitted ? (
                  /* Success State - Enhanced */
                  <div 
                    className={cn(
                      "text-center py-8 transition-all duration-500 ease-out",
                      isSubmitted ? "opacity-100 scale-100" : "opacity-0 scale-95"
                    )}
                  >
                    <div className="relative mb-4">
                      <div className={cn(
                        "w-14 h-14 bg-gradient-to-r from-green-400 to-green-500 rounded-full",
                        "flex items-center justify-center mx-auto shadow-lg",
                        "animate-in zoom-in-0 duration-300"
                      )}>
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      {/* Success ring animation */}
                      <div className="absolute inset-0 w-14 h-14 mx-auto border-2 border-green-400/30 rounded-full animate-ping"></div>
                    </div>
                    <h4 className="text-base font-semibold text-foreground mb-2">Thank you!</h4>
                    <p className="text-sm text-muted-foreground">Your feedback helps us improve</p>
                  </div>
                ) : (
                  /* Feedback Form - Enhanced */
                  <div 
                    className={cn(
                      "space-y-5 transition-all duration-300",
                      !isSubmitted ? "opacity-100" : "opacity-0"
                    )}
                  >
                    
                    {/* Star Rating - Enhanced */}
                    <div className="text-center space-y-4">
                      <p className="text-sm font-medium text-foreground">Rate your experience</p>
                      <div className="flex justify-center gap-1 p-2 rounded-2xl bg-muted/30">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            className={cn(
                              "p-2 transition-all duration-300 ease-out rounded-xl",
                              "hover:scale-110 active:scale-95 hover:bg-background/50",
                              "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-background/50",
                              getStarDisplay(n) && "bg-yellow-50 dark:bg-yellow-950/30"
                            )}
                            onClick={() => setRating(n)}
                            onMouseEnter={() => setHoveredStar(n)}
                            onMouseLeave={() => setHoveredStar(0)}
                          >
                            <Star
                              className={cn(
                                "w-6 h-6 transition-all duration-300",
                                getStarDisplay(n)
                                  ? "text-yellow-500 fill-yellow-400 drop-shadow-sm scale-110" 
                                  : "text-muted-foreground hover:text-yellow-400",
                                hoveredStar >= n && "scale-125"
                              )}
                            />
                          </button>
                        ))}
                      </div>
                      {rating > 0 && (
                        <p className={cn(
                          "text-xs text-muted-foreground transition-all duration-300",
                          "animate-in slide-in-from-top-2"
                        )}>
                          {rating === 1 && "We're sorry to hear that 😔"}
                          {rating === 2 && "We'll work on improving 💪"}
                          {rating === 3 && "Thanks for your feedback 👍"}
                          {rating === 4 && "Glad you liked it! 😊"}
                          {rating === 5 && "Awesome! Thank you! 🎉"}
                        </p>
                      )}
                    </div>

                    {/* Comment - Enhanced */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-foreground block">
                        Tell us more <span className="text-muted-foreground font-normal">(optional)</span>
                      </label>
                      <Textarea
                        placeholder="Share your thoughts, suggestions, or what we can improve..."
                        value={comment}
                        onChange={(value) => setComment(value || "")}
                        className={cn(
                          "text-sm min-h-[80px] resize-none rounded-xl",
                          "border-2 border-border/60 focus:border-primary/70",
                          "transition-all duration-300 focus:ring-4 focus:ring-primary/10",
                          "bg-background/70 backdrop-blur-sm",
                          "placeholder:text-muted-foreground/70"
                        )}
                      />
                    </div>

                    {/* Email - Enhanced */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-foreground block">
                        Email <span className="text-muted-foreground font-normal">(for follow-up)</span>
                      </label>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={cn(
                          "text-sm h-11 rounded-xl",
                          "border-2 border-border/60 focus:border-primary/70",
                          "transition-all duration-300 focus:ring-4 focus:ring-primary/10",
                          "bg-background/70 backdrop-blur-sm",
                          "placeholder:text-muted-foreground/70"
                        )}
                      />
                    </div>

                    {/* Submit Button - Premium */}
                    <Button
                      onClick={handleSubmit}
                      disabled={rating === 0 || isSubmitting}
                      className={cn(
                        "w-full h-12 rounded-xl font-semibold text-base",
                        "bg-gradient-to-r from-primary to-primary/90",
                        "hover:from-primary/90 hover:to-primary/80",
                        "shadow-lg hover:shadow-xl active:shadow-md",
                        "transform transition-all duration-300",
                        "hover:scale-[1.02] active:scale-[0.98]",
                        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                        "focus:ring-4 focus:ring-primary/20"
                      )}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground",
                            "rounded-full animate-spin"
                          )} />
                          <span>Sending feedback...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Send className="h-4 w-4" />
                          <span>Send Feedback</span>
                        </div>
                      )}
                    </Button>
                  </div>
                )}

                {/* Branding - Enhanced */}
                <div className="flex items-center justify-center pt-5 mt-5 border-t border-border/30">
                  <a 
                    href="https://feedbackstar.vercel.app" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={cn(
                      "flex items-center gap-2 text-xs text-muted-foreground",
                      "hover:text-foreground transition-all duration-300",
                      "group cursor-pointer hover:scale-105 active:scale-95"
                    )}
                  >
                    <span className="font-medium">Powered by</span>
                    <Badge variant="outline" className={cn(
                      "text-xs px-3 py-1.5 h-7 border-border/40 rounded-lg",
                      "bg-background/60 backdrop-blur-sm",
                      "group-hover:border-primary/40 group-hover:bg-primary/5",
                      "transition-all duration-300 group-hover:shadow-md"
                    )}>
                      <FeedbackStarLogo size={14} className="mr-1.5 opacity-70 group-hover:opacity-100 transition-all duration-300" />
                      <span className="font-semibold">FeedbackStar</span>
                      <ExternalLink className="ml-1.5 h-3 w-3 opacity-40 group-hover:opacity-70 transition-all duration-300" />
                    </Badge>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </>
  );
}