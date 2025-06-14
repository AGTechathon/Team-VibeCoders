import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { StudyContent } from '../types';

export const useGeminiAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateStudyContent = async (topic: string): Promise<StudyContent | null> => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      setError('Please add your Gemini API key to the .env file');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `
        Create a comprehensive study guide for the topic: "${topic}"
        
        Please provide:
        1. A concise summary (2-3 sentences)
        2. 5-7 key points that are essential to understand
        3. A detailed explanation that covers the important concepts
        
        Format your response as JSON with the following structure:
        {
          "summary": "Brief summary here",
          "keyPoints": ["Point 1", "Point 2", "Point 3", ...],
          "detailedExplanation": "Comprehensive explanation here"
        }
        
        Make it educational, clear, and suitable for focused study and revision.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not parse AI response');
      }
      
      const parsedContent = JSON.parse(jsonMatch[0]);
      
      return {
        topic,
        summary: parsedContent.summary,
        keyPoints: parsedContent.keyPoints,
        detailedExplanation: parsedContent.detailedExplanation,
        isGenerating: false
      };
    } catch (err) {
      console.error('Error generating content:', err);
      setError('Failed to generate content. Please check your API key and try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateStudyContent,
    isLoading,
    error
  };
};