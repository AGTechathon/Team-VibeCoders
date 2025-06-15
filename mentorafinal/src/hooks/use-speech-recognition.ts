// @ts-nocheck
"use client";

import { useState, useEffect, useCallback } from "react";

interface SpeechRecognitionHook {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  isSupported: boolean;
  startListening: (lang?: string) => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

const useSpeechRecognition = (): SpeechRecognitionHook => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(
    null
  );
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      setIsSupported(true);
      const newRecognition = new SpeechRecognitionAPI();
      newRecognition.continuous = true;
      newRecognition.interimResults = true;
      setRecognition(newRecognition);
    } else {
      setIsSupported(false);
      setError("Speech recognition is not supported in this browser.");
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, []); // Run only once

  const handleResult = useCallback((event: SpeechRecognitionEvent) => {
    let finalTranscript = "";
    let currentInterimTranscript = "";
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        currentInterimTranscript += event.results[i][0].transcript;
      }
    }
    setTranscript((prev) => prev + finalTranscript);
    setInterimTranscript(currentInterimTranscript);
  }, []);

  const handleError = useCallback((event: SpeechRecognitionErrorEvent) => {
    console.error("Speech recognition error:", event.error);
    if (event.error === "no-speech") {
      setError("No speech detected. Please try again.");
    } else if (event.error === "audio-capture") {
      setError("Microphone problem. Please ensure it's connected and enabled.");
    } else if (event.error === "not-allowed") {
      setError(
        "Permission to use microphone was denied. Please enable it in browser settings."
      );
    } else {
      setError(`Speech recognition error: ${event.error}`);
    }
    setIsListening(false);
  }, []);

  const handleEnd = useCallback(() => {
    setIsListening(false);
    setInterimTranscript("");
  }, []);

  useEffect(() => {
    if (!recognition) return;

    recognition.onresult = handleResult;
    recognition.onerror = handleError;
    recognition.onend = handleEnd;
  }, [recognition, handleResult, handleError, handleEnd]);

  const startListening = useCallback(
    (lang: string = "en-US") => {
      if (!recognition || isListening) return;
      try {
        setTranscript("");
        setInterimTranscript("");
        setError(null);
        recognition.lang = lang;
        recognition.start();
        setIsListening(true);
      } catch (e) {
        console.error("Error starting recognition:", e);
        setError("Could not start speech recognition.");
        setIsListening(false);
      }
    },
    [recognition, isListening]
  );

  const stopListening = useCallback(() => {
    if (!recognition || !isListening) return;
    recognition.stop();
    setIsListening(false);
  }, [recognition, isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
};

export default useSpeechRecognition;
