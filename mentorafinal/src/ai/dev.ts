
import { config } from 'dotenv';
config();



import '@/ai/flows/grammar-check.ts';
import '@/ai/flows/topic-query-flow.ts';
import '@/ai/flows/validate-topic-flow.ts';
import '@/ai/flows/extempore-topic-flow.ts';
import '@/ai/flows/analyze-interview-answers.ts';
import '@/ai/flows/simulate-interview.ts';  