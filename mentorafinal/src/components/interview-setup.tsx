
"use client";

import type * as React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, ListChecks, Play, Briefcase, Code, BarChart3 } from 'lucide-react';

interface InterviewSetupProps {
  onStartInterview: (jobRole: string, techStack: string, numQuestions: number, difficulty: string) => void;
  loading: boolean;
}

const FormSchema = z.object({
  jobRole: z.string().min(1, "Job role is required."),
  techStack: z.string().optional(),
  numQuestions: z.coerce.number().min(1, "At least 1 question.").max(10, "Maximum 10 questions."),
  difficulty: z.string({ required_error: "Please select a difficulty level." }),
});

export function InterviewSetup({ onStartInterview, loading }: InterviewSetupProps) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      jobRole: "",
      techStack: "",
      numQuestions: 3,
      difficulty: "Medium",
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    onStartInterview(data.jobRole, data.techStack || "", data.numQuestions, data.difficulty);
  }

  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl animate-enter bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-3xl font-headline text-center flex items-center justify-center gap-2">
          <Brain className="w-8 h-8 text-primary" />
          Interview Setup
        </CardTitle>
        <CardDescription className="text-center">
          Configure your AI-powered mock interview session.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="jobRole"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1"><Briefcase className="w-4 h-4" />Job Role</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Senior Software Engineer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="techStack"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1"><Code className="w-4 h-4" />Tech Stack (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., React, Node.js, Python" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="numQuestions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1"><ListChecks className="w-4 h-4" />Number of Questions</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" max="10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1"><BarChart3 className="w-4 h-4" />Difficulty Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Preparing...
                </div>
              ) : (
                <div className="flex items-center gap-2"><Play className="w-5 h-5" />Start Interview</div>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
