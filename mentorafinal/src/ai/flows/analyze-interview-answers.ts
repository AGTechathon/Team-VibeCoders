'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeInterviewAnswersInputSchema = z.object({
  jobRole: z.string().describe('The job role for the interview.'),
  techStack: z.string().optional().describe('The relevant tech stack for the job role.'),
  question: z.string().describe('The question asked during the interview.'),
  answer: z.string().describe('The user provided answer to the question.'),
});
export type AnalyzeInterviewAnswersInput = z.infer<
  typeof AnalyzeInterviewAnswersInputSchema
>;

const AnalyzeInterviewAnswersOutputSchema = z.object({
  sentiment: z
    .string()
    .describe('The overall sentiment of the answer (positive, negative, neutral).'),
  keywords: z
    .array(z.string())
    .describe('Key words and phrases used in the answer relevant to the job role and tech stack.'),
  areasForImprovement: z
    .string()
    .describe('Specific areas where the answer could be improved, considering the job role and tech stack if provided.'),
  overallFeedback: z
    .string()
    .describe('An overall assessment of the answer and its effectiveness for the given job role and tech stack context.'),
});
export type AnalyzeInterviewAnswersOutput = z.infer<
  typeof AnalyzeInterviewAnswersOutputSchema
>;

export async function analyzeInterviewAnswers(
  input: AnalyzeInterviewAnswersInput
): Promise<AnalyzeInterviewAnswersOutput> {
  return analyzeInterviewAnswersFlow(input);
}

const analyzeInterviewAnswersPrompt = ai.definePrompt({
  name: 'analyzeInterviewAnswersPrompt',
  input: {schema: AnalyzeInterviewAnswersInputSchema},
  output: {schema: AnalyzeInterviewAnswersOutputSchema},
  prompt: `You are an friendly AI career coach providing feedback on interview answers.

Analyze the following interview answer for sentiment, keywords, areas for improvement, and overall effectiveness.
The interview context is for a {{jobRole}} role.
{{#if techStack}}
The relevant tech stack for this role is {{techStack}}. Consider this when evaluating the answer.
{{/if}}
Return the analysis in JSON format.

Question: {{{question}}}
Answer: {{{answer}}}
  `,
});

const analyzeInterviewAnswersFlow = ai.defineFlow(
  {
    name: 'analyzeInterviewAnswersFlow',
    inputSchema: AnalyzeInterviewAnswersInputSchema,
    outputSchema: AnalyzeInterviewAnswersOutputSchema,
  },
  async input => {
    const {output} = await analyzeInterviewAnswersPrompt(input);
    return output!;
  }
);
