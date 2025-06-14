'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidateTopicInputSchema = z.object({
  userInput: z.string().describe('The user\'s input intended as a learning topic.'),
});
export type ValidateTopicInput = z.infer<typeof ValidateTopicInputSchema>;

const ValidateTopicOutputSchema = z.object({
  isValidTopic: z.boolean().describe('Whether the input is considered a valid learning topic.'),
  aiMessage: z.string().describe('The AI\'s response to the user, either confirming the topic or asking for clarification.'),
});
export type ValidateTopicOutput = z.infer<typeof ValidateTopicOutputSchema>;

export async function validateTopic(input: ValidateTopicInput): Promise<ValidateTopicOutput> {
  return validateTopicFlow(input);
}

const prompt = ai.definePrompt({
  name: 'validateTopicPrompt',
  input: {schema: ValidateTopicInputSchema},
  output: {schema: ValidateTopicOutputSchema},
  prompt: `You are an AI assistant whose first job is to help a user establish a clear learning topic for a Q&A session.
The user has provided the following input as a potential topic: "{{{userInput}}}"

Your task is to determine if this input is a suitable learning topic.
1.  If the input is a clear and reasonable learning topic (e.g., "JavaScript", "World War 2", "Photosynthesis", "Literary Devices"):
    Set 'isValidTopic' to true.
    Set 'aiMessage' to a confirmation like: "Okay, let's focus on '{{{userInput}}}'. What's your first question about it?"
2.  If the input is a simple greeting (e.g., "hi", "hello", "hey", "good morning"), a polite closing ("bye"), or a very short acknowledgment ("ok", "yes", "thanks", "thank you", "cool", "great"):
    Set 'isValidTopic' to false.
    Set 'aiMessage' to a friendly response like: "Hello! What learning topic are you interested in exploring today?" or "Hi there! To get started, please tell me what subject you'd like to discuss."
3.  If the input is too vague, not clearly a topic, or seems like a question itself rather than a topic declaration (e.g., "help me", "what is this", "explain", "I don't know", "tell me something"):
    Set 'isValidTopic' to false.
    Set 'aiMessage' to a clarifying question like: "To help you best, could you please specify a topic you'd like to learn about? For example, 'Python programming' or 'The Roman Empire'."

Ensure 'aiMessage' is always friendly and guides the user toward specifying a valid learning topic if their initial input isn't one.
Do not attempt to answer any questions or provide explanations about '{{{userInput}}}' in this step. Your sole focus is topic validation and providing the appropriate 'aiMessage'.
Limit the aiMessage to 1-2 sentences.
`,
});

const validateTopicFlow = ai.defineFlow(
  {
    name: 'validateTopicFlow',
    inputSchema: ValidateTopicInputSchema,
    outputSchema: ValidateTopicOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
