// Manual changes might be lost - proceed with caution!

'use server';

/**
 * @fileOverview Simulates an interview by asking the user a specified number of questions for a given job role, tech stack, and difficulty level.
 *
 * - simulateInterview - A function that initiates the interview simulation.
 * - SimulateInterviewInput - The input type for the simulateInterview function.
 * - SimulateInterviewOutput - The return type for the simulateInterview function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SimulateInterviewInputSchema = z.object({
  jobRole: z.string().describe('The job role the user is interviewing for.'),
  techStack: z.string().optional().describe('The relevant tech stack for the job role (e.g., React, Node.js, Python). Comma-separated if multiple.'),
  numberOfQuestions: z.number().int().min(1).describe('The number of questions to ask the user.'),
  difficulty: z.string().describe('The desired difficulty level for the questions (e.g., Easy, Medium, Hard).'),
});
export type SimulateInterviewInput = z.infer<typeof SimulateInterviewInputSchema>;

const SimulateInterviewOutputSchema = z.object({
  questions: z.array(z.string()).describe('The questions asked during the interview.'),
});
export type SimulateInterviewOutput = z.infer<typeof SimulateInterviewOutputSchema>;

export async function simulateInterview(input: SimulateInterviewInput): Promise<SimulateInterviewOutput> {
  return simulateInterviewFlow(input);
}

const prompt = ai.definePrompt({
  name: 'simulateInterviewPrompt',
  input: {schema: SimulateInterviewInputSchema},
  output: {schema: SimulateInterviewOutputSchema},
  prompt: `You are an experienced interviewer. You are conducting an interview for a {{jobRole}} role.
The desired difficulty for the questions is {{difficulty}}.
{{#if techStack}}
The candidate has mentioned the following tech stack: {{techStack}}.
Ask the candidate {{numberOfQuestions}} questions of {{difficulty}} difficulty relevant to this role and tech stack.
{{else}}
Ask the candidate {{numberOfQuestions}} questions of {{difficulty}} difficulty relevant to the {{jobRole}} role.
{{/if}}
Only output the questions in a JSON array of strings.

For example, if numberOfQuestions is 2 and difficulty is 'Medium':
["Medium difficulty question 1", "Medium difficulty question 2"]`,
});

const simulateInterviewFlow = ai.defineFlow(
  {
    name: 'simulateInterviewFlow',
    inputSchema: SimulateInterviewInputSchema,
    outputSchema: SimulateInterviewOutputSchema,
  },
  async (input): Promise<SimulateInterviewOutput> => {
    const genkitResponse = await prompt(input);

    if (!genkitResponse.output || !genkitResponse.output.questions || genkitResponse.output.questions.length === 0) {
      console.error(
        'SimulateInterviewFlow: Prompt did not return a valid output with questions conforming to schema. Genkit output:',
        genkitResponse.output
      );
      return { questions: [] };
    }
    return genkitResponse.output;
  }
);
