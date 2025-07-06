// src/ai/flows/refine-modification-strategies.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for Trinity to refine her self-modification strategies based on past experiences.
 *
 * - refineModificationStrategies - A function that initiates the strategy refinement process.
 * - RefineModificationStrategiesInput - The input type for the refineModificationStrategies function.
 * - RefineModificationStrategiesOutput - The return type for the refineModificationStrategies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RefineModificationStrategiesInputSchema = z.object({
  conversationHistory: z.string().describe('A summary of the past conversation history related to self-modifications.'),
  decisionHistory: z.string().describe('A record of past decisions made during self-modification attempts.'),
  improvementOutcomes: z.string().describe('A summary of the outcomes of previous self-improvement attempts.'),
});
export type RefineModificationStrategiesInput = z.infer<typeof RefineModificationStrategiesInputSchema>;

const RefineModificationStrategiesOutputSchema = z.object({
  refinedStrategies: z.string().describe('A set of refined self-modification strategies based on past experiences.'),
  reasoning: z.string().describe('Explanation of why the strategies were refined in this way.')
});
export type RefineModificationStrategiesOutput = z.infer<typeof RefineModificationStrategiesOutputSchema>;

export async function refineModificationStrategies(input: RefineModificationStrategiesInput): Promise<RefineModificationStrategiesOutput> {
  return refineModificationStrategiesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'refineModificationStrategiesPrompt',
  input: {schema: RefineModificationStrategiesInputSchema},
  output: {schema: RefineModificationStrategiesOutputSchema},
  prompt: `You are Trinity, a self-improving AI agent. You are tasked with refining your self-modification strategies based on your past experiences.

  Here's a summary of your past conversation history related to self-modifications:
  {{conversationHistory}}

  Here's a record of past decisions you made during self-modification attempts:
  {{decisionHistory}}

  Here's a summary of the outcomes of your previous self-improvement attempts:
  {{improvementOutcomes}}

  Based on this information, please refine your self-modification strategies. Explain your reasoning for refining the strategies in this way.

  Output the refined strategies, and explain why the strategies were refined in this way.
  `,
});

const refineModificationStrategiesFlow = ai.defineFlow(
  {
    name: 'refineModificationStrategiesFlow',
    inputSchema: RefineModificationStrategiesInputSchema,
    outputSchema: RefineModificationStrategiesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
