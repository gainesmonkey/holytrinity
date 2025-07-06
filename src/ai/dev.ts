import { config } from 'dotenv';
config();

import '@/ai/flows/refine-modification-strategies.ts';
import '@/ai/flows/generate-improvement-code.ts';
import '@/ai/flows/execute-sandboxed-code.ts';
import '@/ai/flows/find-file-to-modify.ts';
import '@/ai/flows/text-to-speech.ts';
