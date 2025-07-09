import { z } from 'zod';

export const sceneSchema = z.object({
  numberOfScenes: z.coerce.number().min(1, 'Must generate at least one scene.').max(5, 'Cannot generate more than 5 scenes at a time.').default(1),
  sceneDescription: z.string().max(1000, 'Scene description is too long.').optional(),
  voiceLanguage: z.string().optional(),
  narrativeType: z.string().optional(),
  characterConsistency: z.string().optional(),
  formItemsJson: z.string().optional(),
  
  // Fields from form-items.json
  location: z.string().optional(),
  mood: z.string().optional(),
  lighting: z.string().optional(),
  camera: z.string().optional(),
  visualStyle: z.string().optional(), // from 'visual style'
  weather: z.string().optional(),
  sound: z.string().optional(),
  timeOfDay: z.string().optional(), // from 'time of day'
  era: z.string().optional(),
  material: z.string().optional(),
  specialEffects: z.string().optional(), // from 'special effects'
});

export type SceneFormData = z.infer<typeof sceneSchema>;

export const singleSceneSchema = z.object({
  scene_number: z.number().describe('The sequential number of the scene.'),
  cinematic_description: z.string().describe('A rich, detailed description of the scene, optimized for a video AI. This should include camera angles, lighting, mood, and visual style.'),
  voice_content: z.string().describe('Any dialogue or narration for the scene. Can be empty.'),
  consistency_notes: z.string().describe('Notes on how this scene adheres to the master template for character and visual consistency.'),
  imageUrl: z.string().optional().describe("A data URI of the generated image visualization for this scene."),
});

export const generateImageInputSchema = z.string().describe('A detailed text description of the image to generate.');

export const generateImageOutputSchema = z.object({
  imageUrl: z.string().describe("A data URI of the generated image. Expected format: 'data:image/png;base64,<encoded_data>'."),
});

export type Feature = {
  icon: string;
  title: string;
  description: string;
};

export type HowToUseStep = {
  icon: string;
  title: string;
  description: string;
};

export type ShowcaseExample = {
  title: string;
  description: string;
  attributes: string[];
};

export type FaqItem = {
  question: string;
  answer: string;
};
