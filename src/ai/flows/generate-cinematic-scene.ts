'use server';
/**
 * @fileOverview Cinematic scene generation AI flow.
 *
 * - generateCinematicScene - A function that generates a structured cinematic scene.
 * - SceneGenerationInput - The input type for the generateCinematicScene function.
 * - SceneGenerationOutput - The return type for the generateCinematicScene function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { promises as fs } from 'fs';
import path from 'path';
import { sceneSchema, singleSceneSchema } from '@/lib/types';

export type SceneGenerationInput = z.infer<typeof sceneSchema>;

const SceneGenerationOutputSchema = z.object({
  title: z.string().describe("A compelling, short title for the overall story."),
  original_language: z.string().describe("The detected language of the user's input, e.g., 'English', 'Spanish'."),
  selected_attributes: z.object({
    location: z.string().describe("The final location prompt phrase used."),
    mood: z.string().describe("The final mood prompt phrase used."),
    lighting: z.string().describe("The final lighting prompt phrase used."),
    camera: z.string().describe("The final camera prompt phrase used."),
    visualStyle: z.string().describe("The final visual style prompt phrase used."),
    weather: z.string().describe("The final weather prompt phrase used."),
    sound: z.string().describe("The final sound prompt phrase used."),
    timeOfDay: z.string().describe("The final time of day prompt phrase used."),
    era: z.string().describe("The final historical era prompt phrase used."),
    material: z.string().describe("The final key material/texture prompt phrase used."),
    specialEffects: z.string().describe("The final special effects prompt phrase used."),
    narrativeType: z.string().describe("The final narrative type phrase used."),
    characterConsistency: z.string().describe("The final character consistency phrase used."),
  }).describe("The final attributes selected by the AI, integrating user's choice or AI's own selection."),
  master_scene_template: z.object({
    visual_consistency: z.string().describe("A rule-based guide for maintaining a consistent visual style, color palette, and aesthetic across all scenes."),
    character_guidelines: z.string().describe("Detailed guidelines for ensuring characters look and behave consistently, including appearance, mannerisms, and clothing."),
    lighting_mood: z.string().describe("A plan for how lighting will be used to establish and maintain the mood throughout the sequence."),
    narrative_voice: z.string().describe("The tone and style of any voiceover or dialogue. Should it be formal, informal, poetic, etc.?"),
    camera_standards: z.string().describe("Rules for camera work, including preferred shot types (e.g., 'avoid close-ups'), movement, and composition standards."),
    environmental_details: z.string().describe("Guidelines for background elements, props, and setting details to ensure the world feels consistent."),
  }).describe('A master template guiding the overall look and feel of all scenes.'),
  scenes: z.array(singleSceneSchema).describe('An array of scenes in English, optimized for video AI.'),
  translated_scenes: z.array(singleSceneSchema).optional().describe('An array of scenes in the original language, if not English.'),
});

export type SceneGenerationOutput = z.infer<typeof SceneGenerationOutputSchema>;

export async function generateCinematicScene(input: SceneGenerationInput): Promise<SceneGenerationOutput> {
  return generateCinematicSceneFlow(input);
}

const generateCinematicSceneFlow = ai.defineFlow(
  {
    name: 'generateCinematicSceneFlow',
    inputSchema: sceneSchema,
    outputSchema: SceneGenerationOutputSchema,
  },
  async (input) => {
    // Read files on each execution to prevent server hangs and get latest versions.
    const promptTemplate = await fs.readFile(path.join(process.cwd(), 'src', 'data', 'prompt-template.txt'), 'utf8')
      .catch((err) => {
        console.error("FATAL: Could not read prompt template. ", err);
        throw new Error("Could not load the AI's prompt instructions. Please check the server logs.");
      });

    const formItems = await fs.readFile(path.join(process.cwd(), 'src', 'data', 'form-items.json'), 'utf8')
        .then(JSON.parse)
        .catch((err) => {
            console.error("Could not read or parse form-items.json", err);
            throw new Error("Could not load the AI's dynamic options. Please check the server logs.");
        });

    // Define the prompt dynamically within the flow.
    const prompt = ai.definePrompt({
      name: 'generateCinematicScenePrompt',
      input: {schema: sceneSchema},
      output: {schema: SceneGenerationOutputSchema},
      prompt: promptTemplate,
    });

    const {output} = await prompt({
        ...input,
        formItemsJson: JSON.stringify(formItems, null, 2),
    });

    if (!output) {
        throw new Error("The AI failed to generate a valid response. The output was empty.");
    }
    
    return output;
  }
);
