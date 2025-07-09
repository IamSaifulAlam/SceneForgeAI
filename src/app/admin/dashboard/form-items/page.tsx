import { promises as fs } from 'fs';
import path from 'path';
import { FormItemsEditor } from '@/components/admin/form-items-editor';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

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

export default async function FormItemsPage() {
  const formItems = await getFormItems();

  return (
    <Card className="border-dashed h-full flex flex-col">
      <CardHeader>
        <CardTitle>Edit Form Options</CardTitle>
        <CardDescription>
          Modify the dynamic options available in the scene generator form. Add, edit, or remove categories and their items.
        </CardDescription>
      </CardHeader>
      <FormItemsEditor formItems={formItems} />
    </Card>
  );
}
