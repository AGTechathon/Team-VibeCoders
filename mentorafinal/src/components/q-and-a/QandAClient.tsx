
"use client";

import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { Input } from '@/components/ui1/input';
import { Button } from '@/components/ui1/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui1/card';
import { ScrollArea } from '@/components/ui1/scroll-area';
import { topicQuery, type TopicQueryOutput } from '@/ai/flows/topic-query-flow';
import { validateTopic, type ValidateTopicOutput } from '@/ai/flows/validate-topic-flow';
import { useToast } from '@/hooks/use-toast';
import { Loader2, SendHorizontal, MessageCircle, Bot, User, Lightbulb } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isLoading?: boolean;
  text?: string;
  aiStructuredResponse?: {
    mainExplanation?: string;
    example?: string;
    isOutOfScope?: boolean;
    outOfScopeMessage?: string;
  };
}

export function QandAClient() {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);
  const [userInput, setUserInput] = useState<string>('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setChatMessages([
      {
        id: crypto.randomUUID(),
        sender: 'ai',
        text: "Hello! What learning topic would you like to start with?",
        timestamp: new Date(),
      }
    ]);
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [chatMessages]);

  const addAiMessage = (id: string, text?: string, aiStructuredResponse?: ChatMessage['aiStructuredResponse'], isLoading = false) => {
    setChatMessages(prev => [...prev, {
      id,
      sender: 'ai',
      text,
      aiStructuredResponse,
      timestamp: new Date(),
      isLoading,
    }]);
  };

  const updateAiMessage = (id: string, updates: Partial<ChatMessage>) => {
    setChatMessages(prev => prev.map(msg =>
      msg.id === id
        ? {
            ...msg,
            isLoading: false,
            text: updates.text !== undefined ? updates.text : msg.text,
            aiStructuredResponse: updates.aiStructuredResponse !== undefined ? updates.aiStructuredResponse : msg.aiStructuredResponse,
            timestamp: new Date(), 
          }
        : msg
    ));
  };

  const handleSendMessage = async (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    const trimmedInput = userInput.trim();
    if (!trimmedInput) return;

    const userMessageId = crypto.randomUUID();
    const userMessage: ChatMessage = {
      id: userMessageId,
      sender: 'user',
      text: trimmedInput,
      timestamp: new Date(),
    };
    setChatMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsAiTyping(true);

    const aiThinkingMessageId = crypto.randomUUID();

    if (!currentTopic) {
      addAiMessage(aiThinkingMessageId, 'Thinking...', undefined, true);
      try {
        const validationResponse: ValidateTopicOutput = await validateTopic({ userInput: trimmedInput });
        updateAiMessage(aiThinkingMessageId, { text: validationResponse.aiMessage });
        if (validationResponse.isValidTopic) {
          setCurrentTopic(trimmedInput);
        }
      } catch (error) {
        console.error('Topic validation error:', error);
        toast({ title: 'Error', description: 'Failed to validate topic. Please try again.', variant: 'destructive' });
        updateAiMessage(aiThinkingMessageId, { text: "Sorry, I couldn't process that topic. Please try again."});
      } finally {
        setIsAiTyping(false);
      }
    } else {
      addAiMessage(aiThinkingMessageId, 'Thinking...', undefined, true);
      try {
        const response: TopicQueryOutput = await topicQuery({
          topic: currentTopic,
          query: trimmedInput,
        });

        updateAiMessage(aiThinkingMessageId, {
            aiStructuredResponse: {
              mainExplanation: response.mainExplanation,
              example: response.example,
              isOutOfScope: response.isOutOfScope,
              outOfScopeMessage: response.outOfScopeMessage,
            },
            text: undefined, 
        });

        if (response.followUpQuestion && !response.isOutOfScope) {
          addAiMessage(crypto.randomUUID(), response.followUpQuestion);
        }
      } catch (error) {
        console.error('AI query error:', error);
        toast({ title: 'Error', description: 'Failed to get AI response. Please try again.', variant: 'destructive' });
        updateAiMessage(aiThinkingMessageId, { text: "Sorry, I encountered an error while fetching a response." });
      } finally {
        setIsAiTyping(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-h-[700px]">
      <Card className="shadow-xl flex flex-col flex-grow">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center">
            <MessageCircle className="mr-2 h-6 w-6 text-primary" /> AI Chat Q&amp;A
          </CardTitle>
          <CardDescription>
            {currentTopic
              ? <><span className="font-semibold text-primary">{currentTopic}</span>. Ask me anything about it!</>
              : "Start by telling me the learning topic you're interested in."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow overflow-hidden p-0">
          <ScrollArea ref={scrollAreaRef} className="h-full p-4 space-y-4">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex items-end gap-2 text-sm max-w-[85%] md:max-w-[75%]",
                  msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                )}
              >
                {msg.sender === 'ai' && <Bot className="h-7 w-7 text-primary shrink-0 mb-1" />}
                {msg.sender === 'user' && <User className="h-7 w-7 text-accent shrink-0 mb-1" />}
                <div
                  className={cn(
                    "p-3 rounded-xl shadow-md",
                    msg.sender === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-muted text-foreground rounded-bl-none',
                    msg.isLoading && 'animate-pulse'
                  )}
                >
                  <div className="leading-relaxed">
                    {msg.isLoading && msg.text}
                    {msg.text && !msg.isLoading && !msg.aiStructuredResponse && msg.text.split('\n').map((line, index, arr) => (
                      <span key={index}>
                        {line}
                        {index < arr.length - 1 && <br />}
                      </span>
                    ))}
                    {msg.aiStructuredResponse && (
                      <>
                        {msg.aiStructuredResponse.isOutOfScope ? (
                          <p className="whitespace-pre-wrap">{msg.aiStructuredResponse.outOfScopeMessage}</p>
                        ) : (
                          <>
                            {msg.aiStructuredResponse.mainExplanation && (
                              <p className="whitespace-pre-wrap">{msg.aiStructuredResponse.mainExplanation}</p>
                            )}
                            {msg.aiStructuredResponse.example && (
                              <div className="mt-3 pt-3 border-t border-foreground/10">
                                <div className="flex items-center text-sm font-semibold text-primary mb-1">
                                  <Lightbulb className="h-4 w-4 mr-2 shrink-0" />
                                  <span>Example:</span>
                                </div>
                                <p className="text-sm whitespace-pre-wrap opacity-90">{msg.aiStructuredResponse.example}</p>
                              </div>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </div>
                   <p className="text-xs opacity-70 mt-1.5 text-right">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
              </div>
            ))}
            {isAiTyping && !chatMessages.some(msg => msg.isLoading && msg.sender === 'ai') && (
               <div className="flex items-end gap-2 text-sm max-w-[85%] md:max-w-[75%] mr-auto">
                 <Bot className="h-7 w-7 text-primary shrink-0 mb-1" />
                 <div className="p-3 rounded-xl shadow-md bg-muted text-foreground rounded-bl-none animate-pulse">
                   <span className="italic">AI is typing...</span>
                 </div>
               </div>
            )}
          </ScrollArea>
        </CardContent>
        <CardFooter className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
            <Input
              placeholder={currentTopic ? `Ask a question about "${currentTopic}"...` : "Enter a learning topic..."}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="flex-grow bg-card focus:ring-2 focus:ring-primary"
              disabled={isAiTyping}
            />
            <Button type="submit" disabled={isAiTyping || !userInput.trim()} size="icon" className="shrink-0">
              {isAiTyping ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <SendHorizontal className="h-5 w-5" />
              )}
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}

