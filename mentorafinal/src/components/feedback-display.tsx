"use client";

import type * as React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import type { FeedbackResult } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, Lightbulb, MessageSquareText, ThumbsUp, ThumbsDown, Smile, Frown, Meh, Loader2, Sparkles } from 'lucide-react';

interface FeedbackDisplayProps {
  feedbackResults: FeedbackResult[];
  onStartNewInterview: () => void;
  isLoadingAnalysis?: boolean; 
}

const SentimentIcon = ({ sentiment }: { sentiment: string | undefined }) => {
  if (!sentiment) return <Meh className="w-5 h-5 text-muted-foreground" />;
  const lowerSentiment = sentiment.toLowerCase();
  if (lowerSentiment.includes("positive")) return <Smile className="w-5 h-5 text-green-500" />;
  if (lowerSentiment.includes("negative")) return <Frown className="w-5 h-5 text-red-500" />;
  return <Meh className="w-5 h-5 text-yellow-500" />;
};

export function FeedbackDisplay({ feedbackResults, onStartNewInterview, isLoadingAnalysis }: FeedbackDisplayProps) {

  if (isLoadingAnalysis) {
    return (
      <Card className="w-full max-w-3xl shadow-xl animate-enter">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-center flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            Analyzing Your Answers...
          </CardTitle>
          <CardDescription className="text-center">
            Our AI is hard at work providing feedback on your performance. This might take a moment.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-6 py-16">
          <Loader2 className="h-20 w-20 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">Please wait while we process your interview...</p>
        </CardContent>
      </Card>
    );
  }
  
  const overallScore = feedbackResults.reduce((acc, curr) => {
    if (curr.analysis && curr.analysis.sentiment) {
      const sentiment = curr.analysis.sentiment.toLowerCase();
      if (sentiment.includes("positive")) return acc + 2;
      if (sentiment.includes("neutral")) return acc + 1;
    }
    return acc;
  }, 0);
  const maxScore = feedbackResults.length * 2;
  const performancePercentage = maxScore > 0 ? (overallScore / maxScore) * 100 : 0;

  let performanceMessage = "Good effort! There's room for improvement.";
  let performanceIcon = <Meh className="w-10 h-10 text-yellow-500" />;
  if (performancePercentage >= 75) {
    performanceMessage = "Excellent performance! Keep up the great work.";
    performanceIcon = <ThumbsUp className="w-10 h-10 text-accent" />;
  } else if (performancePercentage < 40 && feedbackResults.length > 0) {
     performanceMessage = "Needs significant improvement. Focus on the feedback provided.";
    performanceIcon = <ThumbsDown className="w-10 h-10 text-destructive" />;
  }


  return (
    <Card className="w-full max-w-3xl shadow-xl animate-enter">
      <CardHeader>
        <CardTitle className="text-3xl font-headline text-center flex items-center justify-center gap-2">
          <MessageSquareText className="w-8 h-8 text-primary" />
          Interview Feedback
        </CardTitle>
        <CardDescription className="text-center">
          Here's a breakdown of your performance and areas for growth.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {feedbackResults.length > 0 && (
          <Card className="bg-secondary/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2 justify-center">
                {performanceIcon} Overall Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-lg">{performanceMessage}</p>
              <p className="text-sm text-muted-foreground">You scored {overallScore} out of {maxScore} possible points ({performancePercentage.toFixed(0)}%).</p>
            </CardContent>
          </Card>
        )}

        {feedbackResults.length === 0 && !isLoadingAnalysis && (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <p className="text-xl text-destructive">No feedback available.</p>
            <p className="text-muted-foreground">It seems there was an issue analyzing your answers or no answers were provided.</p>
          </div>
        )}

        <Accordion type="single" collapsible className="w-full">
          {feedbackResults.map((result, index) => (
            <AccordionItem value={`item-${index}`} key={index} className="animate-enter" style={{ animationDelay: `${index * 100}ms` }}>
              <AccordionTrigger className="hover:bg-muted/50 px-4 rounded-md">
                <div className="flex items-center gap-2">
                   <SentimentIcon sentiment={result.analysis?.sentiment} />
                  <span className="font-semibold">Question {index + 1}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-2 pb-4 space-y-4 bg-card border rounded-b-md">
                <div>
                  <h4 className="font-semibold text-primary">Question:</h4>
                  <p className="text-muted-foreground">{result.question}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-primary">Your Answer:</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">{result.answerText}</p>
                </div>
                
                {result.analysis && !result.error && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <Card className="bg-secondary/20">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center gap-1"><Smile className="w-4 h-4 text-green-500"/>Sentiment</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p>{result.analysis.sentiment || "N/A"}</p>
                        </CardContent>
                      </Card>
                       <Card className="bg-secondary/20">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center gap-1"><CheckCircle className="w-4 h-4 text-blue-500"/>Keywords</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {result.analysis.keywords && result.analysis.keywords.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {result.analysis.keywords.map((kw, i) => <Badge key={i} variant="secondary">{kw}</Badge>)}
                            </div>
                          ) : "None identified"}
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="bg-yellow-50 border-yellow-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-1"><Lightbulb className="w-4 h-4 text-yellow-600"/>Areas for Improvement</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-yellow-700 whitespace-pre-wrap">{result.analysis.areasForImprovement || "No specific areas highlighted."}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-green-50 border-green-200">
                      <CardHeader className="pb-2">
                         <CardTitle className="text-base flex items-center gap-1"><ThumbsUp className="w-4 h-4 text-green-600"/>Overall Feedback</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-green-700 whitespace-pre-wrap">{result.analysis.overallFeedback || "No overall feedback provided."}</p>
                      </CardContent>
                    </Card>
                  </>
                )}
                {result.error && (
                  <div className="text-red-600">
                    <AlertTriangle className="w-5 h-5 inline-block mr-2" />
                    <span>Error analyzing this answer: {result.error}</span>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
      <CardFooter>
        <Button onClick={onStartNewInterview} className="w-full">
          Start New Interview
        </Button>
      </CardFooter>
    </Card>
  );
}
