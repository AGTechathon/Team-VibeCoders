"use client";

import type * as React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import useSpeechRecognition from '@/hooks/use-speech-recognition';
import type { UserAnswer, InterviewConfig } from '@/lib/types';
import { Mic, MicOff, Send, SkipForward, AlertCircle, Loader2, Volume2, StopCircle, Briefcase, Code, BarChart3 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { simulateInterview } from '@/ai/flows/simulate-interview';

interface InterviewSessionProps {
  config: InterviewConfig;
  onInterviewComplete: (answers: UserAnswer[]) => void;
  isStartingSession: boolean;
}

export function InterviewSession({ config, onInterviewComplete, isStartingSession }: InterviewSessionProps) {
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [currentAnswerText, setCurrentAnswerText] = useState('');

  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [questionSpokenFlags, setQuestionSpokenFlags] = useState<Record<number, boolean>>({});
  const speechAttemptIdRef = useRef(0);

  const { toast } = useToast();
  const {
    isListening,
    transcript,
    interimTranscript,
    error: speechError,
    isSupported: speechSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  useEffect(() => {
    setCurrentAnswerText(transcript);
  }, [transcript]);

  const speak = useCallback((text: string, questionIndexForSpeak: number) => {
    if (!('speechSynthesis' in window)) {
      toast({ variant: "destructive", title: "TTS Error", description: "Text-to-speech is not supported in your browser." });
      setQuestionSpokenFlags(prev => ({ ...prev, [questionIndexForSpeak]: true }));
      return;
    }
    window.speechSynthesis.cancel(); 

    const currentSpeechAttemptId = ++speechAttemptIdRef.current;
    const utterance = new SpeechSynthesisUtterance(text);

    utterance.onstart = () => {
      if (currentSpeechAttemptId === speechAttemptIdRef.current) {
        setIsAISpeaking(true);
      }
    };

    utterance.onend = () => {
      setQuestionSpokenFlags(prev => ({ ...prev, [questionIndexForSpeak]: true }));
      if (currentSpeechAttemptId === speechAttemptIdRef.current) {
        setIsAISpeaking(false);
        if (speechSupported && !isListening && currentQuestionIndex === questionIndexForSpeak) {
          resetTranscript();
          setCurrentAnswerText('');
          setTimeout(() => {
            if (!isListening && !isAISpeaking && currentQuestionIndex === questionIndexForSpeak) {
               startListening();
            }
          }, 200);
        }
      }
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      toast({ variant: "destructive", title: "TTS Error", description: "Could not speak the question." });
      setQuestionSpokenFlags(prev => ({ ...prev, [questionIndexForSpeak]: true }));
      if (currentSpeechAttemptId === speechAttemptIdRef.current) {
        setIsAISpeaking(false);
      }
    };
    
    setIsAISpeaking(true); 
    window.speechSynthesis.speak(utterance);

  }, [toast, speechSupported, isListening, startListening, resetTranscript, currentQuestionIndex]);


  useEffect(() => {
    async function fetchQuestions() {
      if (!config.jobRole || !config.numQuestions || !config.difficulty) return;
      setIsLoadingQuestions(true);
      setQuestionSpokenFlags({});
      speechAttemptIdRef.current = 0; 
      try {
        const result = await simulateInterview({
          jobRole: config.jobRole,
          techStack: config.techStack,
          numberOfQuestions: config.numQuestions,
          difficulty: config.difficulty,
        });
        if (result.questions && result.questions.length > 0) {
          setQuestions(result.questions);
        } else {
          toast({ variant: "destructive", title: "Error", description: "Could not load questions. Try different inputs, number of questions, or difficulty." });
          onInterviewComplete([]);
        }
      } catch (error) {
        console.error("Failed to fetch questions:", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to fetch interview questions. Please try again." });
        onInterviewComplete([]);
      } finally {
        setIsLoadingQuestions(false);
      }
    }
    fetchQuestions();
  }, [config, toast, onInterviewComplete]);

  const currentQuestion = questions.length > 0 ? questions[currentQuestionIndex] : "";

  useEffect(() => {
    if (isLoadingQuestions || isStartingSession) return;
    if (!currentQuestion) return;
    if (isAISpeaking || isListening || questionSpokenFlags[currentQuestionIndex]) return;

    speak(currentQuestion, currentQuestionIndex);

  }, [currentQuestion, isLoadingQuestions, isStartingSession, isAISpeaking, isListening, questionSpokenFlags, currentQuestionIndex, speak]);


  const handleNextQuestion = useCallback(() => {
    if (isListening) {
      stopListening();
    }
    speechAttemptIdRef.current++; 
    window.speechSynthesis.cancel();
    setIsAISpeaking(false);


    const answerTextToSave = currentAnswerText.trim() || "No answer provided.";
    const answer: UserAnswer = {
      question: questions[currentQuestionIndex], 
      answerText: answerTextToSave,
    };
    const updatedAnswers = [...userAnswers, answer];
    setUserAnswers(updatedAnswers);
    resetTranscript();
    setCurrentAnswerText('');

    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      onInterviewComplete(updatedAnswers);
    }
  }, [currentQuestionIndex, questions, currentAnswerText, isListening, userAnswers, onInterviewComplete, resetTranscript, stopListening]);


  const toggleRecording = () => {
    if (!speechSupported) {
      toast({ variant: "destructive", title: "Unsupported", description: "Speech recognition is not supported in your browser." });
      return;
    }
    if (isAISpeaking) {
      speechAttemptIdRef.current++;
      window.speechSynthesis.cancel();
      setIsAISpeaking(false);
      setQuestionSpokenFlags(prev => ({ ...prev, [currentQuestionIndex]: true })); 
      resetTranscript();
      setCurrentAnswerText('');
      startListening(); 
      return;
    }

    if (isListening) {
      stopListening(); 
      handleNextQuestion(); 
    } else {
      resetTranscript();
      setCurrentAnswerText('');
      startListening();
    }
  };

  useEffect(() => {
    if(speechError) {
      toast({ variant: "destructive", title: "Speech Error", description: speechError });
       if (isListening) stopListening();
    }
  }, [speechError, toast, isListening, stopListening]);

  useEffect(() => {
    return () => {
      speechAttemptIdRef.current++; 
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);


  if (isLoadingQuestions || isStartingSession) {
    return (
      <Card className="w-full max-w-lg mx-auto shadow-xl animate-enter bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-center">Preparing Your Interview...</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4 py-12">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
          <p className="text-muted-foreground text-center">
            Generating {config.difficulty} questions for role: {config.jobRole}
            {config.techStack && ` (Tech: ${config.techStack})`}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (questions.length === 0 && !isLoadingQuestions) {
    return (
       <Card className="w-full max-w-lg mx-auto shadow-xl animate-enter bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-center">Interview Session</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4 py-12">
            <AlertCircle className="h-16 w-16 text-destructive" />
            <p className="text-destructive text-center">No questions were loaded. Please try starting a new interview with different criteria.</p>
            <Button onClick={() => onInterviewComplete([])}>End Session</Button>
        </CardContent>
      </Card>
    );
  }

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  let placeholderText = "Your transcribed answer will appear here.";
  if (isAISpeaking) {
    placeholderText = "AI is speaking... please wait to respond.";
  } else if (isListening) {
    placeholderText = "Listening... your answer is being transcribed. Click 'Stop Recording & Submit' when done.";
  } else if (!speechSupported) {
    placeholderText = "Speech recognition not supported. This feature is voice-only.";
  } else if (currentQuestion && !isAISpeaking && !isListening && questionSpokenFlags[currentQuestionIndex]) {
     placeholderText = "Click 'Record Answer' to respond or 'Skip Question'.";
  } else if (currentQuestion && !isAISpeaking && !isListening && !questionSpokenFlags[currentQuestionIndex]){
    placeholderText = "Waiting for AI to ask the question...";
  }


  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl animate-enter bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-3xl font-headline text-center">Interview Session</CardTitle>
        <CardDescription className="text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {config.jobRole}</span>
            {config.techStack && <span className="mx-1">|</span>}
            {config.techStack && <span className="flex items-center gap-1"><Code className="w-4 h-4" /> {config.techStack}</span>}
            <span className="mx-1">|</span>
            <span className="flex items-center gap-1"><BarChart3 className="w-4 h-4" /> {config.difficulty}</span>
          </div>
          Question {currentQuestionIndex + 1} of {questions.length}
        </CardDescription>
        <Progress value={progress} className="w-full mt-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 border rounded-md bg-secondary/50 min-h-[100px] flex items-center justify-between">
          <h2 className="text-xl font-semibold text-primary font-headline flex-grow">
            {isAISpeaking && <Volume2 className="inline mr-2 h-5 w-5 animate-pulse" />}
            {currentQuestion}
          </h2>
          {isAISpeaking && (
            <Button variant="ghost" size="icon" onClick={() => {
                speechAttemptIdRef.current++; 
                window.speechSynthesis.cancel();
                setIsAISpeaking(false);
                setQuestionSpokenFlags(prev => ({ ...prev, [currentQuestionIndex]: true }));
                if (speechSupported && !isListening) {
                  resetTranscript();
                  setCurrentAnswerText('');
                  startListening();
                }
              }}
              title="Stop AI Speaking & Start Recording"
            >
              <StopCircle className="h-5 w-5" />
            </Button>
          )}
        </div>

        {!speechSupported && (
           <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Speech Recognition Not Supported</AlertTitle>
            <AlertDescription>
              Your browser does not support speech recognition. Voice-only features will not work.
            </AlertDescription>
          </Alert>
        )}

        <Textarea
          placeholder={placeholderText}
          value={isListening && interimTranscript ? `${currentAnswerText} ${interimTranscript}` : currentAnswerText}
          readOnly
          rows={6}
          className="resize-none bg-muted/20 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          aria-label="Your transcribed answer"
        />
         {isListening && interimTranscript && <p className="text-sm text-muted-foreground italic">Listening...</p>}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between gap-4">
        <Button
          onClick={toggleRecording}
          variant={isListening ? "destructive" : "outline"}
          disabled={!speechSupported || isAISpeaking || (!isListening && !questionSpokenFlags[currentQuestionIndex] && !!currentQuestion) }
          className="w-full sm:w-auto"
          title={isListening ? "Stop Recording & Submit Answer" : (speechSupported ? (questionSpokenFlags[currentQuestionIndex] || !currentQuestion ? "Record Answer" : "Wait for AI to speak") : "Speech not supported")}
        >
          {isListening ? <MicOff className="mr-2 h-5 w-5" /> : <Mic className="mr-2 h-5 w-5" />}
          {isListening ? "Stop Recording & Submit" : "Record Answer"}
        </Button>
        <Button
          onClick={handleNextQuestion}
          className="w-full sm:w-auto"
          disabled={isAISpeaking || isListening}
          title={currentQuestionIndex + 1 < questions.length ? "Skip to Next Question" : "Finish Interview"}
        >
          {currentQuestionIndex + 1 < questions.length ? (
            <>Skip Question <SkipForward className="ml-2 h-5 w-5" /></>
          ) : (
            <>Finish Interview <Send className="ml-2 h-5 w-5" /></>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
    
