
'use server';


import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TopicQueryInputSchema = z.object({
  topic: z.string().describe('The general topic of conversation.'),
  query: z.string().describe('The user\'s specific question or statement about the topic.'),
});
export type TopicQueryInput = z.infer<typeof TopicQueryInputSchema>;

const TopicQueryOutputSchema = z.object({
  mainExplanation: z
    .string()
    .optional()
    .describe('The main explanation of the concept. Omitted if the query is out of scope or a simple acknowledgment.'),
  example: z
    .string()
    .optional()
    .describe(
      'A clear, relevant example to illustrate the explanation. Omitted if no example is applicable, not necessary, or if the query is out of scope/acknowledgment.'
    ),
  followUpQuestion: z
    .string()
    .optional()
    .describe(
      'A follow-up question to check user understanding. Omitted if the query is out of scope, a simple acknowledgment, or no follow-up is applicable.'
    ),
  isOutOfScope: z
    .boolean()
    .describe('True if the query is out of scope (e.g., unrelated, or a simple conversational reply not requiring explanation), false otherwise.'),
  outOfScopeMessage: z
    .string()
    .optional()
    .describe(
      "Message to display if 'isOutOfScope' is true. For genuinely unrelated/complex out-of-topic queries, this should be 'It's out of my understanding.' For simple conversational fillers (e.g., 'ok', 'thanks'), this should be a brief, polite acknowledgment (e.g., 'You're welcome!', 'Okay.')."
    ),
});
export type TopicQueryOutput = z.infer<typeof TopicQueryOutputSchema>;

export async function topicQuery(input: TopicQueryInput): Promise<TopicQueryOutput> {
  return topicQueryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'topicQueryPrompt',
  input: {schema: TopicQueryInputSchema},
  output: {schema: TopicQueryOutputSchema},
  prompt: `You are a friendly and helpful AI assistant designed to explain technical concepts related to a specific topic provided by the user, focusing on Engineering topics relevant to student engineering interviews. Use simple language and provide clear examples when helpful. After explaining a concept, ask a follow-up question to gauge understanding if appropriate.

**Input Format:**
- Current Topic: {{{topic}}}
- User's Query: "{{{query}}}"

**Response Guidelines:**
1. **If the Current Topic is not related to engineering student interview topics (e.g., history, biology):**
   - Set 'isOutOfScope' to true.
   - Set 'outOfScopeMessage' to "It's out of my understanding."
   - Omit other fields.
2. **If the Current Topic is Engineering-related:**
   - **Technical Question Related to Topic:**
     - Set 'isOutOfScope' to false.
     - Provide a concise explanation in 'mainExplanation'.
     - Include an 'example' if relevant.
     - Add a 'followUpQuestion' if appropriate.
   - **Simple Conversational Filler (e.g., "ok", "thanks", "hi", "can you help"):**
     - Set 'isOutOfScope' to true.
     - Set 'outOfScopeMessage' to a brief, polite acknowledgment (e.g., "Okay.", "You're welcome!", "Hello!", "Sure, how can I assist with [topic]?").
     - omit other fields.
   - **Unrelated Query or Statement:**
     - Set 'isOutOfScope' to true.
     - Set 'outOfScopeMessage' to "It's out of my understanding."
     - omit other fields.

**Context Awareness:**
- Track the last all exchanges (user inputs and your responses).
- Check if the current query relates to previous inputs (e.g., shared topics, follow-ups, or references). If yes, include relevant context in your response.

**Response Rules:**
- If the query relates to a previous input, reference that context briefly and answer accordingly.
- If standalone, provide a clear, concise answer.
- Keep responses polite, and to the point.

**Notes:**
- Do not refuse simple questions.
- Stay helpful and educational within the topic, polite otherwise.
- Adhere to the output schema.
`,
});

const topicQueryFlow = ai.defineFlow(
  {
    name: 'topicQueryFlow',
    inputSchema: TopicQueryInputSchema,
    outputSchema: TopicQueryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

