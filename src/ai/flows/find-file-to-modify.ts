'use server';

/**
 * @fileOverview An AI agent that identifies the correct file to modify based on user instructions.
 *
 * - findFileToModify - A function that identifies which file to modify.
 * - FindFileToModifyInput - The input type for the findFileToModify function.
 * - FindFileToModifyOutput - The return type for the findFileToModify function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FindFileToModifyInputSchema = z.object({
  filePaths: z.array(z.string()).describe('The list of available file paths to choose from.'),
  instructions: z.string().describe('The user\'s instructions for code modification.'),
});
export type FindFileToModifyInput = z.infer<typeof FindFileToModifyInputSchema>;

const FindFileToModifyOutputSchema = z.object({
  filePath: z.string().describe('The full path of the file that should be modified.'),
});
export type FindFileToModifyOutput = z.infer<typeof FindFileToModifyOutputSchema>;

export async function findFileToModify(input: FindFileToModifyInput): Promise<FindFileToModifyOutput> {
  return findFileToModifyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findFileToModifyPrompt',
  input: {schema: FindFileToModifyInputSchema},
  output: {schema: FindFileToModifyOutputSchema},
  prompt: `You are an expert software engineer routing tasks. Your job is to analyze a user's instruction and determine which file should be modified.

Consider the user's instructions carefully. Based on their request, select the most appropriate file from the list provided.

Only respond with the single, most relevant file path.

Available files:
{{#each filePaths}}
- {{{this}}}
{{/each}}

User Instructions:
"{{{instructions}}}"
`,
});

const findFileToModifyFlow = ai.defineFlow(
  {
    name: 'findFileToModifyFlow',
    inputSchema: FindFileToModifyInputSchema,
    outputSchema: FindFileToModifyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
