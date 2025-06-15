
'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateExtemporeTopicInputSchema = z.object({
  _seed: z.number().optional().describe("A random seed to ensure input uniqueness, not used by the prompt directly."),
});
export type GenerateExtemporeTopicInput = z.infer<typeof GenerateExtemporeTopicInputSchema>;


const GenerateExtemporeTopicOutputSchema = z.object({
  topic: z.string().describe('A random topic suitable for a short extempore speech.'),
});
export type GenerateExtemporeTopicOutput = z.infer<typeof GenerateExtemporeTopicOutputSchema>;

export async function generateExtemporeTopic(): Promise<GenerateExtemporeTopicOutput> {
  return generateExtemporeTopicFlow({ _seed: Date.now() });
}

const prompt = ai.definePrompt({
  name: 'generateExtemporeTopicPrompt',
  output: {schema: GenerateExtemporeTopicOutputSchema},
  prompt: `You are an AI assistant that provides interesting and diverse topics for extempore speeches.
Please generate one random topic. The topic should be suitable for a 1-2 minute speech.
Avoid overly controversial or highly niche topics. Aim for general interest.

Examples of good topics:
- The future of remote work.
- The importance of lifelong learning.
- My favorite travel destination.
- The impact of social media on society.
- A book that changed my perspective.

Generate one such topic.
`,
});

const generateExtemporeTopicFlow = ai.defineFlow(
  {
    name: 'generateExtemporeTopicFlow',
    inputSchema: GenerateExtemporeTopicInputSchema,
    outputSchema: GenerateExtemporeTopicOutputSchema,
  },
  async (input) => { 
    const {output} = await prompt({}); 
    return output!;
  }
);
