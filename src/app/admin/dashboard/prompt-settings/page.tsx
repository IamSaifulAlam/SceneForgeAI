import { promises as fs } from 'fs';
import path from 'path';
import { PromptSettingsEditor } from '@/components/admin/prompt-settings-editor';
import {
  Card,
} from '@/components/ui/card';

async function getPromptTemplate(): Promise<string> {
    const filePath = path.join(process.cwd(), 'src', 'data', 'prompt-template.txt');
    try {
        return await fs.readFile(filePath, 'utf8');
    } catch (error) {
        console.error("Failed to read prompt template:", error);
        return "Could not load prompt template. Check `src/data/prompt-template.txt`.";
    }
}

async function getFormItems(): Promise<Record<string, { label: string; prompt: string }[]>> {
  const filePath = path.join(process.cwd(), 'src', 'data', 'form-items.json');
   try {
    const file = await fs.readFile(filePath, 'utf8');
    if (!file) return {};
    return JSON.parse(file);
  } catch (error) {
    console.error('Failed to read form-items.json:', error);
    return {};
  }
}

export default async function PromptSettingsPage() {
  const [promptTemplate, formItems] = await Promise.all([
    getPromptTemplate(),
    getFormItems(),
  ]);

  return (
    <Card className="border-dashed h-full flex flex-col">
      <PromptSettingsEditor template={promptTemplate} formItems={formItems} />
    </Card>
  );
}
