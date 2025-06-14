"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  grammarCheck,
  type GrammarCheckOutput,
  type Suggestion,
} from "@/ai/flows/grammar-check";
import {
  generateExtemporeTopic,
  type GenerateExtemporeTopicOutput,
} from "@/ai/flows/extempore-topic-flow";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Sparkles,
  Mic,
  MicOff,
  BookOpen,
  CheckCircle,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { calculateAutoRating } from "@/lib/autoRater";

let recognition: any = null;
if (typeof window !== "undefined") {
  recognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;
}

export function GrammarCheckClient() {
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);
  const [isLoadingTopic, setIsLoadingTopic] = useState(false);

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  const [analysisResult, setAnalysisResult] =
    useState<GrammarCheckOutput | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [speechApiSupported, setSpeechApiSupported] = useState(true);

  const { toast } = useToast();
  const suggestionsContainerRef = useRef<HTMLUListElement>(null);

  const isListeningRef = useRef(isListening);
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognitionAPI =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (!SpeechRecognitionAPI) {
        console.error("SpeechRecognition is not supported in this browser.");
        setSpeechApiSupported(false);
        toast({
          title: "Unsupported Browser",
          description: "Speech recognition is not supported here.",
          variant: "destructive",
        });
        return;
      }

      recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        console.log("Speech recognition started");

        setIsListening(true);
        toast({ description: "Listening..." });
      };

      recognition.onresult = (event: any) => {
        const recognizedTranscriptChunk = event.results[0][0].transcript.trim();
        console.log("Transcript chunk:", recognizedTranscriptChunk);

        if (recognizedTranscriptChunk) {
          setTranscript((prev) =>
            (prev + " " + recognizedTranscriptChunk).trim()
          );
          toast({ description: `You said: ${recognizedTranscriptChunk}` });
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        toast({
          title: "Recognition Error",
          description: `Error: ${event.error}`,
          variant: "destructive",
        });
        if (isListeningRef.current) setIsListening(false);
      };

      recognition.onend = () => {
        console.log("Speech recognition ended.");

        if (isListeningRef.current) {
        }
      };

      return () => {
        if (recognition) {
          recognition.onstart = null;
          recognition.onresult = null;
          recognition.onerror = null;
          recognition.onend = null;
          if (isListeningRef.current) {
            recognition.stop();
          }
        }
      };
    } else {
      setSpeechApiSupported(false);
    }
  }, []);

  const handleGetTopic = async () => {
    setIsLoadingTopic(true);
    setCurrentTopic(null);
    setTranscript("");
    setAnalysisResult(null);
    if (isListeningRef.current && recognition) {
      isListeningRef.current = false;
      recognition.stop();
      setIsListening(false);
    }
    try {
      const response: GenerateExtemporeTopicOutput =
        await generateExtemporeTopic();
      setCurrentTopic(response.topic);
      toast({
        title: "New Topic Ready!",
        description: `Your topic is: "${response.topic}"`,
        variant: "default",
      });
    } catch (error) {
      console.error("Failed to get topic:", error);
      toast({
        title: "Error",
        description: "Failed to generate a new topic. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingTopic(false);
    }
  };

  const [rating, setRating] = useState<{
    score: number;
    label: string;
    description: string;
  } | null>(null);

  const handleSpeechAnalysis = async (speechText: string) => {
    if (!speechText.trim()) {
      toast({ description: "No speech to analyze.", variant: "default" });
      return;
    }
    setIsLoadingAnalysis(true);
    setAnalysisResult(null);
    try {
      const response = await grammarCheck({
        text: speechText,
        topic: currentTopic || undefined,
      });
      setAnalysisResult(response); // This is probably already there
      const autoScore = calculateAutoRating(response);
      setRating(autoScore);

      // const rating = calculateAutoRating(response);

      setAnalysisResult(response);
      toast({
        title: "Speech Analysis Complete",
        description: "Suggestions are ready.",
        variant: "default",
      });
    } catch (error) {
      console.error("Speech analysis error:", error);
      toast({
        title: "Analysis Error",
        description: "Failed to analyze speech. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const toggleListening = () => {
    if (!recognition || !speechApiSupported) {
      toast({
        title: "Speech API Not Ready",
        description: "Cannot start listening.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      isListeningRef.current = false;
      recognition.stop();
      setIsListening(false);
      if (transcript.trim()) {
        handleSpeechAnalysis(transcript.trim());
      } else {
        toast({
          description: "No speech recorded to analyze.",
          variant: "default",
        });
      }
    } else {
      try {
        recognition.start();
      } catch (err) {
        console.error("Error starting recognition:", err);
        toast({
          title: "Could not start listening",
          description: "Please ensure microphone permissions are granted.",
          variant: "destructive",
        });
        setIsListening(false);
      }
    }
  };

  const handleHighlightClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.tagName === "MARK" && target.dataset.suggestionId) {
      const suggestionId = target.dataset.suggestionId;
      const suggestionElement = document.getElementById(
        `suggestion-${suggestionId}`
      );
      if (suggestionElement) {
        suggestionElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        suggestionElement.classList.add(
          "ring-2",
          "ring-primary",
          "transition-all",
          "duration-1000"
        );
        setTimeout(() => {
          suggestionElement.classList.remove(
            "ring-2",
            "ring-primary",
            "transition-all",
            "duration-1000"
          );
        }, 1500);
      }
    }
  };

  const getSuggestionTypeColor = (type: Suggestion["type"]) => {
    switch (type) {
      case "grammar":
        return "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400";
      case "filler":
        return "border-yellow-500/50 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
      case "complex_word":
        return "border-purple-500/50 bg-purple-500/10 text-purple-700 dark:text-purple-400";
      case "clarity":
        return "border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-400";
      case "conciseness":
        return "border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400";
      default:
        return "border-accent/30 bg-accent/10 text-foreground";
    }
  };
  const getSuggestionTypeIcon = (type: Suggestion["type"]) => {
    switch (type) {
      case "grammar":
        return <CheckCircle className="h-5 w-5 text-red-500" />;
      case "filler":
        return <Info className="h-5 w-5 text-yellow-500" />;
      case "complex_word":
        return <BookOpen className="h-5 w-5 text-purple-500" />;
      default:
        return <Sparkles className="h-5 w-5 text-accent" />;
    }
  };

  return (
    <div className="space-y-6">
      {}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center">
            <Mic className="mr-2 h-6 w-6 text-primary" /> Extempore Practice
          </CardTitle>
          <CardDescription>
            {currentTopic ? (
              <>
                Your extempore topic is:{" "}
                <strong className="text-primary">{currentTopic}</strong>. Press
                "Start Speaking" or "Stop Speaking & Analyze" below.
              </>
            ) : (
              'Click "Get Extempore Topic" to begin your practice.'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!speechApiSupported && (
            <Alert variant="destructive">
              <MicOff className="h-5 w-5" />
              <AlertTitle>Speech Recognition Not Supported</AlertTitle>
              <AlertDescription>
                Your browser doesn't support the Web Speech API. Please use a
                browser like Chrome or Edge for this feature.
              </AlertDescription>
            </Alert>
          )}
          <Button
            onClick={handleGetTopic}
            disabled={isLoadingTopic || !speechApiSupported}
            size="lg"
          >
            {isLoadingTopic ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <BookOpen className="mr-2 h-5 w-5" />
            )}
            Get Extempore Topic
          </Button>
          {currentTopic && (
            <Alert
              variant="default"
              className="bg-primary/10 border-primary/30"
            >
              <BookOpen className="h-5 w-5 text-primary" />
              <AlertTitle className="text-primary font-semibold">
                Your Topic:
              </AlertTitle>
              <AlertDescription className="text-lg">
                {currentTopic}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>

        {currentTopic && speechApiSupported && (
          <CardFooter className="flex-col items-start space-y-4">
            <Button
              onClick={toggleListening}
              disabled={isLoadingAnalysis || !currentTopic}
              size="lg"
              variant={isListening ? "destructive" : "default"}
            >
              {isListening ? (
                <>
                  {" "}
                  <MicOff className="mr-2 h-5 w-5" /> Stop Speaking & Analyze{" "}
                </>
              ) : (
                <>
                  {" "}
                  <Mic className="mr-2 h-5 w-5" /> Start Speaking{" "}
                </>
              )}
            </Button>
            <div className="w-full p-3 border rounded-md min-h-[100px] bg-muted/30">
              <p className="text-muted-foreground text-sm mb-1">
                Your speech transcript (accumulates until analyzed):
              </p>
              <p>{transcript}</p>
              {isListening && !transcript && (
                <p className="text-sm text-muted-foreground italic">
                  Waiting for speech...
                </p>
              )}
              {!isListening && !transcript && !analysisResult && (
                <p className="text-sm text-muted-foreground italic">
                  Click "Start Speaking" to begin once you have a topic. Click
                  "Stop Speaking & Analyze" when done.
                </p>
              )}
            </div>
          </CardFooter>
        )}
      </Card>

      {isLoadingAnalysis && (
        <Card className="shadow-md">
          <CardContent className="p-6 text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">
              Analyzing your speech...
            </p>
          </CardContent>
        </Card>
      )}

      {analysisResult && (
        <div className="space-y-6">
          {analysisResult.overallFeedback && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-headline flex items-center">
                  <Sparkles className="mr-2 h-5 w-5 text-accent" />
                  Overall Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base">{analysisResult.overallFeedback}</p>
              </CardContent>
            </Card>
          )}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-headline">
                Analyzed & Corrected Transcript
              </CardTitle>
              <CardDescription>
                Click on a highlighted section to see the related suggestion.
                This analysis uses the Genkit grammar check flow.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="p-4 rounded-md border border-dashed bg-muted/30 min-h-[150px] text-base prose prose-sm max-w-none whitespace-pre-wrap"
                onClick={handleHighlightClick}
                dangerouslySetInnerHTML={{
                  __html:
                    analysisResult.highlightedCorrectedText ||
                    analysisResult.analyzedText,
                }}
              />
            </CardContent>
          </Card>

          {analysisResult.suggestions &&
            analysisResult.suggestions.length > 0 && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-headline">
                    Detailed Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-3">
                    <ul ref={suggestionsContainerRef} className="space-y-3">
                      {analysisResult.suggestions.map((suggestion) => (
                        <li
                          key={suggestion.id}
                          id={`suggestion-${suggestion.id}`}
                        >
                          <Alert
                            variant="default"
                            className={cn(
                              "border",
                              getSuggestionTypeColor(suggestion.type)
                            )}
                          >
                            {getSuggestionTypeIcon(suggestion.type)}
                            <AlertTitle className="capitalize">
                              {suggestion.type.replace("_", " ")}
                            </AlertTitle>
                            <AlertDescription>
                              <p>{suggestion.text}</p>
                              {suggestion.originalSegment && (
                                <p className="mt-1 text-xs italic">
                                  Original: "{suggestion.originalSegment}"
                                </p>
                              )}
                              {suggestion.suggestedReplacement && (
                                <p className="mt-1 text-xs">
                                  Suggested: "{suggestion.suggestedReplacement}"
                                </p>
                              )}
                            </AlertDescription>
                          </Alert>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          {!analysisResult.suggestions &&
            analysisResult.overallFeedback &&
            analysisResult.analyzedText === analysisResult.correctedText && (
              <Card className="shadow-md">
                <CardContent className="p-6">
                  <p className="text-muted-foreground">
                    No specific suggestions were generated, likely because the
                    speech was deemed off-topic or no correctable issues were
                    found based on the current analysis scope.
                  </p>
                </CardContent>
              </Card>
            )}
        </div>
      )}
      <div>
        {rating && (
          <div className="mt-6 p-4 rounded-xl bg-blue-100 dark:bg-blue-900 shadow">
            <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-300">
              Auto Rating
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {rating.score}/10 - {rating.label}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {rating.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
