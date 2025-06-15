
'use server';


import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GrammarCheckInputSchema = z.object({
  text: z.string().describe('The speech transcript to analyze for grammar and speaking improvements.'),
  topic: z.string().optional().describe('The topic of the speech, if provided, for context and relevance assessment.'),
});

export type GrammarCheckInput = z.infer<typeof GrammarCheckInputSchema>;

const SuggestionSchema = z.object({
  id: z.string().describe("A unique identifier for this suggestion (e.g., 's1', 's2'). This ID must match a data-suggestion-id in highlightedCorrectedText."),
  text: z.string().describe("The suggestion text explaining the correction or improvement."),
  type: z.enum(["grammar", "filler", "complex_word", "clarity", "conciseness"])
    .describe("The type of suggestion: 'grammar' for grammatical errors, 'filler' for verbal fillers (e.g., um, uh, like), 'complex_word' for overly complex vocabulary, 'clarity' for clarity improvements, 'conciseness' for conciseness improvements."),
  originalSegment: z.string().optional().describe("The original text segment that this suggestion refers to. For fillers, this would be the filler itself."),
  suggestedReplacement: z.string().optional().describe("The suggested replacement for the original segment. For fillers, this might be empty (suggesting removal) or a rephrased segment.")
});

export type Suggestion = z.infer<typeof SuggestionSchema>;

const GrammarCheckOutputSchema = z.object({
  analyzedText: z.string().describe('The original speech transcript that was analyzed. This is always populated.'),
  correctedText: z.string().describe('If the speech was on-topic, this is the clean version with improvements. If off-topic, this will be the same as analyzedText, as no detailed corrections are made.'),
  highlightedCorrectedText: z.string().describe('If on-topic, the transcript where problematic segments are wrapped in <mark data-suggestion-id="unique_id">segment</mark> HTML tags. If off-topic, this will be the same as analyzedText with no highlights.'),
  suggestions: z.array(SuggestionSchema).describe('If on-topic, an array of suggestion objects, each with a unique id, the suggestion text, its type, etc. If off-topic, this will be an empty array.'),
  overallFeedback: z.string().describe("Overall feedback on the speech. If the speech is deemed off-topic, this feedback MUST primarily state that and explain why, and detailed speech analysis (grammar, fillers etc.) should be skipped. If on-topic, this feedback should include an assessment of clarity, flow, engagement, delivery, and topic relevance."),
});

export type GrammarCheckOutput = z.infer<typeof GrammarCheckOutputSchema>;

export async function grammarCheck(input: GrammarCheckInput): Promise<GrammarCheckOutput> {
  return grammarCheckFlow(input);
}

const grammarCheckPrompt = ai.definePrompt({
  name: 'speechAnalysisPrompt',
  input: {schema: GrammarCheckInputSchema},
  output: {schema: GrammarCheckOutputSchema},
  prompt: `You are an AI-powered speech and writing coach.
Your primary task is to first evaluate if the user's speech transcript is relevant to the provided topic.
Then, provide feedback and analysis accordingly.

Input Transcript:
{{{text}}}

{{#if topic}}
The user was asked to speak on the following topic: "{{{topic}}}"
First, determine if the transcript is relevant to this topic.
{{else}}
No specific topic was provided. Proceed with general speech analysis.
{{/if}}

Output Requirements:
You MUST provide five fields: \`analyzedText\`, \`correctedText\`, \`highlightedCorrectedText\`, \`suggestions\`, and \`overallFeedback\`.

1.  \`analyzedText\`: This should always be the original input transcript: "{{{text}}}".

{{#if topic}}
2.  Topic Relevance Assessment:
    *   IF the transcript is NOT relevant to the topic "{{{topic}}}":
        *   \`overallFeedback\`: MUST clearly state that the speech was off-topic and explain why. Do NOT provide detailed grammar, filler, or complex word analysis in this feedback.
        *   \`correctedText\`: Set this to be the same as \`analyzedText\` (i.e., "{{{text}}}").
        *   \`highlightedCorrectedText\`: Set this to be the same as \`analyzedText\` (i.e., "{{{text}}}"). No highlights.
        *   \`suggestions\`: Set this to an empty array [].
        *   SKIP the detailed analysis steps below (grammar, fillers, etc.).
    *   IF the transcript IS relevant to the topic "{{{topic}}}":
        *   Proceed with the detailed analysis steps below. \`overallFeedback\` should include a note on good topic relevance.
{{/if}}

Detailed Analysis Steps (Perform ONLY if speech is on-topic, or if no topic was provided):
*   \`correctedText\`: The final, clean version of the transcript. Apply grammatical corrections. Where appropriate, remove obvious verbal fillers or replace complex words with simpler alternatives if it improves clarity. This text should NOT contain any HTML markup or markdown.
*   \`highlightedCorrectedText\`: This is the transcript (preferably based on \`correctedText\` for grammar fixes, or \`analyzedText\` for highlighting fillers/complex words in their original context) where specific problematic segments are wrapped in HTML <mark> tags.
    *   Each <mark> tag MUST have a \`data-suggestion-id\` attribute (e.g., \`<mark data-suggestion-id="s1">problematic segment</mark>\`).
    *   The value of \`data-suggestion-id\` (e.g., "s1") MUST be a unique string identifier that corresponds EXACTLY to the \`id\` of a suggestion in the \`suggestions\` array.
    *   Highlight:
        *   Grammatical errors (showing the corrected version within the mark).
        *   Verbal fillers (e.g., "um", "uh", "like", "you know", "actually", "basically", "literally", "sort of", "kind of"). Highlight the filler itself.
        *   Overly complex words or jargon that could be simplified. Highlight the complex word.
        *   Segments that could be clearer or more concise.
    *   Ensure the highlighted text accurately reflects the segment related to the suggestion.
*   \`suggestions\`: An array of objects. Each object MUST have:
    *   \`id\`: A unique string identifier (e.g., "s1", "s2"). This \`id\` MUST be used in the \`data-suggestion-id\` attribute of a corresponding <mark> tag in \`highlightedCorrectedText\`. Every suggestion must have a corresponding highlight.
    *   \`text\`: A clear and concise explanation of the issue and the suggested improvement.
    *   \`type\`: One of "grammar", "filler", "complex_word", "clarity", "conciseness".
    *   \`originalSegment\`: The exact text segment from the input transcript that this suggestion pertains to.
    *   \`suggestedReplacement\` (optional): If applicable, the suggested replacement text.
*   \`overallFeedback\`: Provide 1-2 sentences of overall constructive feedback.
    *   Include an assessment of clarity, flow, engagement, and pacing if discernible from the text.
    {{#if topic}}
    *   (If on-topic) Reiterate or confirm that the speech was relevant to "{{{topic}}}".
    {{/if}}
    *   Other general observations or encouragement.

Critically ensure (if on-topic analysis is performed):
- Every \`data-suggestion-id\` in \`highlightedCorrectedText\` has a matching \`id\` in one of the \`suggestions\` objects.
- Every suggestion object in the \`suggestions\` array has its \`id\` referenced by at least one \`<mark data-suggestion-id>\` tag in \`highlightedCorrectedText\`.
- IDs are simple strings (e.g., "s1", "fix2", "change3").
- The text content within the <mark> tags is the segment being pointed out.
- Be thorough in identifying various types of issues if performing detailed analysis.

Remember: If a topic is provided and the speech is off-topic, DO NOT perform detailed grammar analysis; focus the \`overallFeedback\` on the irrelevance and ensure \`correctedText\`, \`highlightedCorrectedText\` are same as \`analyzedText\`, and \`suggestions\` is empty.
`,
});

const grammarCheckFlow = ai.defineFlow(
  {
    name: 'grammarCheckFlow',
    inputSchema: GrammarCheckInputSchema,
    outputSchema: GrammarCheckOutputSchema,
  },
  async input => {
    const {output} = await grammarCheckPrompt(input);
    if (output) {
        output.analyzedText = output.analyzedText || input.text; 
        output.suggestions = output.suggestions || []; 
        output.correctedText = output.correctedText === undefined ? input.text : output.correctedText;
        output.highlightedCorrectedText = output.highlightedCorrectedText === undefined ? input.text : output.highlightedCorrectedText;
        output.overallFeedback = output.overallFeedback || "Could not generate feedback.";
    }
    return output!;
  }
);
