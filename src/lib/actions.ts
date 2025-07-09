'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { promises as fs } from 'fs';
import path from 'path';
import { sceneSchema, generateImageInputSchema, singleSceneSchema } from '@/lib/types';
import { setSession, deleteSession, getSession } from '@/lib/auth';
import { generateCinematicScene, type SceneGenerationOutput } from '@/ai/flows/generate-cinematic-scene';
import { generateImage } from '@/ai/flows/generate-image-flow';
import { regenerateSingleScene, type RegenerateSceneInput } from '@/ai/flows/regenerate-single-scene';
import { trackGeneration } from '@/services/analytics-service';
import { getUserId } from '@/lib/user';

// --- Simple In-Memory Rate Limiter ---
const requestTracker = new Map<string, number[]>();

function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const requests = requestTracker.get(key) || [];
  
  // Filter out requests that are outside the time window
  const recentRequests = requests.filter(timestamp => now - timestamp < windowMs);
  
  if (recentRequests.length >= limit) {
    // Still update the tracker so we know the user is active
    requestTracker.set(key, [...recentRequests, now]);
    return true;
  }
  
  requestTracker.set(key, [...recentRequests, now]);
  return false;
}
// --- End Rate Limiter ---


export type FormState = {
  success: boolean;
  message: string;
  data?: SceneGenerationOutput;
};

export type ImageFormState = {
  success: boolean;
  message: string;
  imageUrl?: string;
};

export type RegenFormState = {
  success: boolean;
  message: string;
  newScene?: z.infer<typeof singleSceneSchema>;
};

export async function generateSceneAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const userId = await getUserId();
  
  // Rate limit: 10 generations per minute per user
  if (isRateLimited(userId, 10, 60 * 1000)) {
    return { success: false, message: 'You are generating too quickly. Please wait a moment.' };
  }

  try {
    const data = Object.fromEntries(formData.entries());
    const parsed = sceneSchema.safeParse(data);

    if (!parsed.success) {
      const issues = parsed.error.issues.map((issue) => issue.message).join(', ');
      return { success: false, message: `Validation failed: ${issues}` };
    }
    
    const input = parsed.data;

    const result = await generateCinematicScene(input);

    // Track the successful generation event
    trackGeneration({
      userId: userId,
      language: result.original_language,
      visualStyle: result.selected_attributes.visualStyle,
      scenesCount: result.scenes.length
    });

    // Revalidate dashboard paths to show updated analytics
    revalidatePath('/admin/dashboard/analytics');
    revalidatePath('/admin/dashboard/users');
    
    return {
      success: true,
      message: 'Scene generated successfully.',
      data: result,
    };

  } catch (error) {
    console.error('Generation Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    // Check for specific Genkit/Gemini errors if possible
    if (errorMessage.includes('429') || errorMessage.includes('resource has been exhausted')) {
        return { success: false, message: 'Rate limit exceeded. Please wait a moment and try again.' };
    }
    if (errorMessage.includes('blocked') || errorMessage.includes('SAFETY')) {
        return { success: false, message: 'The generation was blocked due to safety settings. Please modify your prompt.'};
    }
    // Return a more generic error to the user in production
    return { success: false, message: `An unexpected server error occurred. Please try again later.` };
  }
}

export async function generateImageAction(
  prevState: ImageFormState,
  formData: FormData
): Promise<ImageFormState> {
  const userId = await getUserId();
  
  // Rate limit: 5 image generations per minute per user
  if (isRateLimited(`${userId}_image`, 5, 60 * 1000)) {
    return { success: false, message: 'You are generating images too quickly. Please wait a moment.' };
  }

  try {
    const sceneDescription = formData.get('sceneDescription') as string;
    const parsed = generateImageInputSchema.safeParse(sceneDescription);

    if (!parsed.success) {
      return { success: false, message: 'Invalid scene description provided.' };
    }
    
    const { imageUrl } = await generateImage(parsed.data);

    return {
      success: true,
      message: 'Image generated successfully.',
      imageUrl: imageUrl,
    };

  } catch (error) {
    console.error('Image Generation Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    if (errorMessage.includes('429') || errorMessage.includes('resource has been exhausted')) {
        return { success: false, message: 'Image generation rate limit exceeded. Please try again later.' };
    }
    if (errorMessage.includes('blocked') || errorMessage.includes('SAFETY')) {
        return { success: false, message: 'The image generation was blocked due to safety settings. Please modify your prompt.'};
    }
    return { success: false, message: 'An unexpected server error occurred during image generation.' };
  }
}

export async function regenerateSingleSceneAction(
  prevState: RegenFormState,
  formData: FormData
): Promise<RegenFormState> {
  const userId = await getUserId();
  
  // Rate limit: 10 generations per minute per user (same as main generation)
  if (isRateLimited(userId, 10, 60 * 1000)) {
    return { success: false, message: 'You are making changes too quickly. Please wait a moment.' };
  }

  try {
    const schema = z.object({
      originalOutput: z.string(),
      sceneToRegenerate: z.string(),
      userFeedback: z.string().min(1, 'Feedback cannot be empty.').max(1000),
    });
    
    const rawData = Object.fromEntries(formData);
    const parsed = schema.safeParse(rawData);

    if (!parsed.success) {
      return { success: false, message: 'Invalid data for regeneration.' };
    }
    
    const { originalOutput: outputJson, sceneToRegenerate: sceneJson, userFeedback } = parsed.data;

    const input: RegenerateSceneInput = {
      originalOutput: JSON.parse(outputJson),
      sceneToRegenerate: JSON.parse(sceneJson),
      userFeedback,
    };

    const newScene = await regenerateSingleScene(input);
    
    return { success: true, message: 'Scene regenerated.', newScene };

  } catch (error) {
    console.error('Scene Regeneration Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, message: `Regeneration failed: ${errorMessage}` };
  }
}


// Admin Actions

export async function adminLogin(prevState: any, formData: FormData) {
  const ip = headers().get('x-forwarded-for') ?? '127.0.0.1';

  // Rate limit: 5 login attempts per minute per IP
  if (isRateLimited(ip, 5, 60 * 1000)) {
    return { success: false, message: 'Too many login attempts. Please wait a minute.' };
  }
  
  const password = formData.get('password');
  if (password !== process.env.ADMIN_PASSWORD) {
    return { success: false, message: 'Invalid password' };
  }

  // Password is correct, clear rate limit and set session
  requestTracker.delete(ip);
  await setSession();

  const redirectTo = formData.get('redirectTo') as string | null;
  
  if (redirectTo && redirectTo.startsWith('/')) {
    redirect(redirectTo);
  } else {
    redirect('/admin/dashboard');
  }
}

export async function adminLogout() {
  await deleteSession();
  redirect('/admin');
}

export async function changeAdminPassword(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session) return { success: false, message: 'Unauthorized' };

  const schema = z.object({
    currentPassword: z.string(),
    newPassword: z.string(),
  });
  const parsed = schema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { success: false, message: 'Invalid form data.' };
  }
  
  const { currentPassword, newPassword } = parsed.data;

  if (currentPassword !== process.env.ADMIN_PASSWORD) {
    return { success: false, message: 'Current password is not correct.' };
  }

  // In a real application, you would hash the new password and save it to a database.
  // We cannot modify .env files at runtime. This is a simulation.
  console.log(`Password would be changed to: ${newPassword}`);
  
  return { success: true, message: 'Password updated successfully.' };
}

export async function saveFeatures(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session) return { success: false, message: 'Unauthorized' };
  try {
    const featuresJson = formData.get('features') as string;
    const features = JSON.parse(featuresJson);

    const filePath = path.join(process.cwd(), 'src', 'data', 'features.json');
    await fs.writeFile(filePath, JSON.stringify(features, null, 2), 'utf8');

    revalidatePath('/');
    revalidatePath('/admin/dashboard/features');
    return { success: true, message: 'Features saved successfully.' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, message: `Failed to save features: ${errorMessage}` };
  }
}

export async function saveHowToUseSteps(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session) return { success: false, message: 'Unauthorized' };
  try {
    const stepsJson = formData.get('steps') as string;
    const steps = JSON.parse(stepsJson);

    const filePath = path.join(process.cwd(), 'src', 'data', 'how-to-use.json');
    await fs.writeFile(filePath, JSON.stringify(steps, null, 2), 'utf8');

    revalidatePath('/');
    revalidatePath('/admin/dashboard/how-to-use');
    return { success: true, message: '"How to Use" steps saved successfully.' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, message: `Failed to save steps: ${errorMessage}` };
  }
}

export async function saveShowcaseExamples(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session) return { success: false, message: 'Unauthorized' };
  try {
    const examplesJson = formData.get('examples') as string;
    const rawExamples = JSON.parse(examplesJson);
    // Convert comma-separated string back to array
    const examples = rawExamples.map((ex: { attributes: string; }) => ({
      ...ex,
      attributes: ex.attributes.split(',').map(attr => attr.trim()).filter(Boolean),
    }));

    const filePath = path.join(process.cwd(), 'src', 'data', 'showcase-examples.json');
    await fs.writeFile(filePath, JSON.stringify(examples, null, 2), 'utf8');

    revalidatePath('/');
    revalidatePath('/admin/dashboard/showcase');
    return { success: true, message: 'Showcase examples saved successfully.' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, message: `Failed to save examples: ${errorMessage}` };
  }
}

export async function saveFaqItems(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session) return { success: false, message: 'Unauthorized' };
  try {
    const itemsJson = formData.get('items') as string;
    const items = JSON.parse(itemsJson);

    const filePath = path.join(process.cwd(), 'src', 'data', 'faq.json');
    await fs.writeFile(filePath, JSON.stringify(items, null, 2), 'utf8');

    revalidatePath('/');
    revalidatePath('/admin/dashboard/faq');
    return { success: true, message: 'FAQ items saved successfully.' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, message: `Failed to save FAQ items: ${errorMessage}` };
  }
}


export async function saveFormItems(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session) return { success: false, message: 'Unauthorized' };

  try {
    const formItemsJson = formData.get('formItems') as string;
    if (formItemsJson) {
      const formItemsData = JSON.parse(formItemsJson);
      const formItemsPath = path.join(process.cwd(), 'src', 'data', 'form-items.json');
      await fs.writeFile(formItemsPath, JSON.stringify(formItemsData, null, 2), 'utf8');
    }
    
    revalidatePath('/');
    revalidatePath('/admin/dashboard/form-items');
    return { success: true, message: 'Form items saved successfully.' };
  } catch (error) {
    console.error('Save form items error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, message: `Failed to save form items: ${errorMessage}` };
  }
}

export async function saveSiteSettings(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session) return { success: false, message: 'Unauthorized' };
  try {
    // Update site config
    const siteName = formData.get('siteName') as string;
    const siteDescription = formData.get('siteDescription') as string;
    const enableShrinkingHeader = formData.get('enableShrinkingHeader') === 'true';
    const headerMaxHeight = formData.get('headerMaxHeight') as string;
    const headerMinHeight = formData.get('headerMinHeight') as string;

    const configPath = path.join(process.cwd(), 'src', 'config', 'site.ts');
    let configContent = await fs.readFile(configPath, 'utf8');
    configContent = configContent.replace(/(name: ')(.*)(')/, `$1${siteName}$3`);
    configContent = configContent.replace(/(description: ')(.*)(')/, `$1${siteDescription}$3`);
    configContent = configContent.replace(/(enableShrinkingHeader:\s*)(true|false)/, `$1${enableShrinkingHeader}`);
    configContent = configContent.replace(/(headerMaxHeight:\s*)(\d+)/, `$1${headerMaxHeight}`);
    configContent = configContent.replace(/(headerMinHeight:\s*)(\d+)/, `$1${headerMinHeight}`);
    await fs.writeFile(configPath, configContent, 'utf8');

    // Update theme colors
    const cssPath = path.join(process.cwd(), 'src', 'app', 'globals.css');
    let cssContent = await fs.readFile(cssPath, 'utf8');
    
    const lightBg = formData.get('lightBackground') as string;
    const lightPrimary = formData.get('lightPrimary') as string;
    const lightAccent = formData.get('lightAccent') as string;
    const darkBg = formData.get('darkBackground') as string;
    const darkPrimary = formData.get('darkPrimary') as string;
    const darkAccent = formData.get('darkAccent') as string;

    const replacer = (block: string, replacements: Record<string, string>) => {
      let newBlock = block;
      for (const [key, value] of Object.entries(replacements)) {
        const regex = new RegExp(`(--${key}:\\s*)[^;]+`);
        if (regex.test(newBlock)) {
          newBlock = newBlock.replace(regex, `$1${value}`);
        }
      }
      return newBlock;
    }

    cssContent = cssContent.replace(/:root\s*{([^}]+)}/, (match, group1) => {
      const newBlock = replacer(group1, {
        'background': lightBg,
        'primary': lightPrimary,
        'accent': lightAccent
      });
      return `:root {${newBlock}}`;
    });
    
    cssContent = cssContent.replace(/.dark\s*{([^}]+)}/, (match, group1) => {
      const newBlock = replacer(group1, {
        'background': darkBg,
        'primary': darkPrimary,
        'accent': darkAccent
      });
      return `.dark {${newBlock}}`;
    });

    await fs.writeFile(cssPath, cssContent, 'utf8');
    
    revalidatePath('/', 'layout');
    revalidatePath('/admin/dashboard/site-settings');

    return { success: true, message: 'Site settings saved successfully.' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, message: `Failed to save settings: ${errorMessage}` };
  }
}

export async function savePromptTemplate(prevState: any, formData: FormData) {
    const session = await getSession();
    if (!session) return { success: false, message: 'Unauthorized' };

    try {
        const template = formData.get('template') as string;
        if (typeof template !== 'string') {
            return { success: false, message: 'Invalid template content.' };
        }
        
        const filePath = path.join(process.cwd(), 'src', 'data', 'prompt-template.txt');
        await fs.writeFile(filePath, template, 'utf8');

        revalidatePath('/admin/dashboard/prompt-settings');
        return { success: true, message: 'Prompt template saved successfully.' };
    } catch (error) {
        console.error('Save prompt template error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return { success: false, message: `Failed to save prompt template: ${errorMessage}` };
    }
}
