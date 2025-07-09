'use server';
/**
 * @fileOverview An AI flow for generating images from a text description.
 *
 * - generateImage - A function that handles the image generation process.
 * - GenerateImageInput - The input type for the generateImage function.
 * - GenerateImageOutput - The return type for the generateImage function.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { generateImageInputSchema, generateImageOutputSchema } from '@/lib/types';


export type GenerateImageInput = z.infer<typeof generateImageInputSchema>;
export type GenerateImageOutput = z.infer<typeof generateImageOutputSchema>;

export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
  return generateImageFlow(input);
}

const generateImageFlow = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: generateImageInputSchema,
    outputSchema: generateImageOutputSchema,
  },
  async (prompt) => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: prompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });
    
    if (!media || !media.url) {
        throw new Error("Image generation failed to return a valid image.");
    }

    return { imageUrl: media.url };
  }
);
