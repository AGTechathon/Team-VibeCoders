"use client";

import type * as React from "react";
import { useState, useCallback } from "react";
import { InterviewSetup } from "@/components/interview-setup";
import { InterviewSession } from "@/components/interview-session";
import { FeedbackDisplay } from "@/components/feedback-display";
import { analyzeInterviewAnswers } from "@/ai/flows/analyze-interview-answers";
import type {
  InterviewConfig,
  UserAnswer,
  FeedbackResult,
  AppState,
} from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Bot } from "lucide-react";

export default function MockInterview
() {
  const [appState, setAppState] = useState<AppState>("setup");
  const [interviewConfig, setInterviewConfig] =
    useState<InterviewConfig | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [feedbackResults, setFeedbackResults] = useState<FeedbackResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();

  const handleStartInterview = useCallback(
    (
      jobRole: string,
      techStack: string,
      numQuestions: number,
      difficulty: string
    ) => {
      setIsLoading(true);
      setInterviewConfig({ jobRole, techStack, numQuestions, difficulty });
      setUserAnswers([]);
      setFeedbackResults([]);
      setAppState("interview");
      setTimeout(() => setIsLoading(false), 300);
    },
    []
  );

  const handleInterviewComplete = useCallback(
    async (answers: UserAnswer[]) => {
      setUserAnswers(answers);
      setAppState("analyzing");
      setIsLoading(true);

      if (!interviewConfig) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Interview configuration is missing.",
        });
        setAppState("setup");
        setIsLoading(false);
        return;
      }

      if (answers.length === 0) {
        toast({
          title: "Interview Ended",
          description: "No answers were provided. Moving to feedback screen.",
        });
        setFeedbackResults([]);
        setAppState("feedback");
        setIsLoading(false);
        return;
      }

      const results: FeedbackResult[] = [];
      for (const answer of answers) {
        try {
          const analysis = await analyzeInterviewAnswers({
            jobRole: interviewConfig.jobRole,
            techStack: interviewConfig.techStack,
            question: answer.question,
            answer: answer.answerText,
          });
          results.push({ ...answer, analysis });
        } catch (error) {
          console.error("Failed to analyze answer:", error);
          toast({
            variant: "destructive",
            title: "Analysis Error",
            description: `Could not analyze: "${answer.question.substring(
              0,
              30
            )}..."`,
          });
          results.push({
            ...answer,
            analysis: null,
            error: (error as Error).message || "Unknown error during analysis.",
          });
        }
      }
      setFeedbackResults(results);
      setAppState("feedback");
      setIsLoading(false);
    },
    [interviewConfig, toast]
  );

  const handleStartNewInterview = useCallback(() => {
    setAppState("setup");
    setInterviewConfig(null);
    setUserAnswers([]);
    setFeedbackResults([]);
  }, []);

  const renderContent = () => {
    switch (appState) {
      case "setup":
        return (
          <InterviewSetup
            onStartInterview={handleStartInterview}
            loading={isLoading}
          />
        );
      case "interview":
        if (!interviewConfig) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Missing interview config. Returning to setup.",
          });
          setAppState("setup");
          return (
            <InterviewSetup
              onStartInterview={handleStartInterview}
              loading={isLoading}
            />
          );
        }
        return (
          <InterviewSession
            config={interviewConfig}
            onInterviewComplete={handleInterviewComplete}
            isStartingSession={isLoading}
          />
        );
      case "analyzing":
        return (
          <FeedbackDisplay
            feedbackResults={[]}
            onStartNewInterview={handleStartNewInterview}
            isLoadingAnalysis={true}
          />
        );
      case "feedback":
        return (
          <FeedbackDisplay
            feedbackResults={feedbackResults}
            onStartNewInterview={handleStartNewInterview}
            isLoadingAnalysis={false}
          />
        );
      default:
        return (
          <InterviewSetup
            onStartInterview={handleStartInterview}
            loading={isLoading}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl w-full mx-4 p-10 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
       
        {renderContent()}
      </div>
    </div>
  );
}
