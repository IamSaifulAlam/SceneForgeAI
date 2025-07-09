'use server';
/**
 * @fileOverview AI flow for regenerating a single cinematic scene.
 *
 * - regenerateSingleScene - A function that regenerates a scene based on user feedback.
 * - RegenerateSceneInput - The input type for the regenerateSingleScene function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { singleSceneSchema } from '@/lib/types';
import type { SceneGenerationOutput } from './generate-cinematic-scene';

export interface RegenerateSceneInput {
  originalOutput: SceneGenerationOutput;
  sceneToRegenerate: z.infer<typeof singleSceneSchema>;
  userFeedback: string;
}

export async function regenerateSingleScene(input: RegenerateSceneInput): Promise<z.infer<typeof singleSceneSchema>> {
  return regenerateSingleSceneFlow(input);
}

const RegenerateSceneFlowInputSchema = z.object({
  master_template_json: z.string(),
  all_scenes_json: z.string(),
  scene_to_regenerate_json: z.string(),
  scene_number: z.number(),
  user_feedback: z.string(),
});

const prompt = ai.definePrompt({
  name: 'regenerateSingleScenePrompt',
  input: { schema: RegenerateSceneFlowInputSchema },
  output: { schema: singleSceneSchema },
  prompt: `You are a screenwriter and film director revising a script. Your task is to rewrite a single scene based on user feedback while maintaining strict consistency with the established 'Master Scene Template'. Do NOT change the scene number.

CONTEXT:
You previously generated a series of scenes. Here is the master template you must adhere to:
--- MASTER TEMPLATE START ---
{{{master_template_json}}}
--- MASTER TEMPLATE END ---

Here is the full context of all scenes in the sequence:
--- FULL SCENE SEQUENCE START ---
{{{all_scenes_json}}}
--- FULL SCENE SEQUENCE END ---

SCENE TO REVISE:
Here is the original version of the scene you need to rewrite (Scene #{{{scene_number}}}):
--- ORIGINAL SCENE START ---
{{{scene_to_regenerate_json}}}
--- ORIGINAL SCENE END ---

USER'S FEEDBACK FOR REVISION:
"{{{user_feedback}}}"

YOUR TASK:
Rewrite ONLY Scene #{{{scene_number}}}.
1.  Carefully incorporate the user's feedback.
2.  Ensure the new 'cinematic_description', 'voice_content', and 'consistency_notes' are updated.
3.  The rewritten scene MUST strictly follow all rules from the Master Scene Template provided above.
4.  The 'consistency_notes' for the new scene must be updated to reflect how the revised scene still adheres to the template.
5.  Your output MUST be ONLY the JSON object for the single revised scene.
`,
});

const regenerateSingleSceneFlow = ai.defineFlow(
  {
    name: 'regenerateSingleSceneFlow',
    inputSchema: z.any(), // Using any because the input object is complex
    outputSchema: singleSceneSchema,
  },
  async (input: RegenerateSceneInput) => {
    const { output } = await prompt({
      master_template_json: JSON.stringify(input.originalOutput.master_scene_template, null, 2),
      all_scenes_json: JSON.stringify(input.originalOutput.scenes, null, 2),
      scene_to_regenerate_json: JSON.stringify(input.sceneToRegenerate, null, 2),
      scene_number: input.sceneToRegenerate.scene_number,
      user_feedback: input.userFeedback,
    });
    
    if (!output) {
      throw new Error("The AI failed to regenerate the scene.");
    }

    // Ensure the scene number is preserved
    return { ...output, scene_number: input.sceneToRegenerate.scene_number };
  }
);
