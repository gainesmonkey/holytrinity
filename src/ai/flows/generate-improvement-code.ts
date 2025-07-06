// This file is machine-generated - edit at your own risk.

'use server';

/**
 * @fileOverview An AI agent that generates improved code snippets based on user instructions for self-modification.
 *
 * - generateImprovementCode - A function that handles the generation of improved code snippets.
 * - GenerateImprovementCodeInput - The input type for the generateImprovementCode function.
 * - GenerateImprovementCodeOutput - The return type for the generateImprovementCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImprovementCodeInputSchema = z.object({
  sourceCode: z.string().describe('The source code to be improved.'),
  instructions: z.string().describe('The instructions for improving the code.'),
});
export type GenerateImprovementCodeInput = z.infer<typeof GenerateImprovementCodeInputSchema>;

const GenerateImprovementCodeOutputSchema = z.object({
  improvedCode: z.string().describe('The improved code snippet.'),
});
export type GenerateImprovementCodeOutput = z.infer<typeof GenerateImprovementCodeOutputSchema>;

export async function generateImprovementCode(
  input: GenerateImprovementCodeInput
): Promise<GenerateImprovementCodeOutput> {
  return generateImprovementCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateImprovementCodePrompt',
  input: {schema: GenerateImprovementCodeInputSchema},
  output: {schema: GenerateImprovementCodeOutputSchema},
  prompt: `You are an expert software engineer. You will analyze the provided source code and generate an improved version based on the given instructions.

Source Code:
{{{sourceCode}}}

Instructions:
{{{instructions}}}

Improved Code:
`,
});

const generateImprovementCodeFlow = ai.defineFlow(
  {
    name: 'generateImprovementCodeFlow',
    inputSchema: GenerateImprovementCodeInputSchema,
    outputSchema: GenerateImprovementCodeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
