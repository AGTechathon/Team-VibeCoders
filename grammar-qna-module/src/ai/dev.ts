
import { config } from 'dotenv';
config();

// import '@/ai/flows/question-generation.ts'; // Removed as unused
// import '@/ai/flows/ai-tutoring.ts'; // Removed as unused
import '@/ai/flows/grammar-check.ts';
import '@/ai/flows/topic-query-flow.ts';
import '@/ai/flows/validate-topic-flow.ts';
import '@/ai/flows/extempore-topic-flow.ts';

