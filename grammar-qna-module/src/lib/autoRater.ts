import type { GrammarCheckOutput, Suggestion } from "@/ai/flows/grammar-check";

export function calculateAutoRating(data: GrammarCheckOutput): {
  score: number;
  label: string;
  description: string;
} {
  const totalSuggestions = data.suggestions.length;

  const counts = {
    grammar: 0,
    filler: 0,
    complex_word: 0,
    clarity: 0,
    conciseness: 0,
  };

  data.suggestions.forEach((s: Suggestion) => {
    counts[s.type]++;
  });

  const totalWords = data.analyzedText.split(/\s+/).length;
  const changesRatio = totalSuggestions / totalWords;

  // Base score is 10
  let baseScore = 10.0;

  // Deduct points based on issues (scale up from 5-point to 10-point)
  baseScore -= Math.min(changesRatio * 10, 4.0); // Heavier penalty for many issues
  baseScore -= counts.filler * 0.2;
  baseScore -= counts.complex_word * 0.2;
  baseScore -= counts.grammar * 0.4;
  baseScore -= (counts.clarity + counts.conciseness) * 0.3;

  // Clamp score between 1 and 10
  baseScore = Math.max(1, Math.min(10, baseScore));

  let label = "Excellent";
  if (baseScore < 9) label = "Great";
  if (baseScore < 7.5) label = "Good";
  if (baseScore < 6) label = "Average";
  if (baseScore < 4) label = "Needs Improvement";
  if (baseScore < 2) label = "Poor";

  const description = `${label} (${baseScore.toFixed(
    1
  )}/10) based on ${totalSuggestions} suggestions.`;

  return {
    score: parseFloat(baseScore.toFixed(1)),
    label,
    description,
  };
}
