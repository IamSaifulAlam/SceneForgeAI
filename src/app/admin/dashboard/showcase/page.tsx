import { promises as fs } from 'fs';
import path from 'path';
import { ShowcaseExample } from '@/lib/types';
import { ShowcaseEditor } from '@/components/admin/showcase-editor';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

async function getShowcaseExamples(): Promise<ShowcaseExample[]> {
  const filePath = path.join(process.cwd(), 'src', 'data', 'showcase-examples.json');
  try {
    const file = await fs.readFile(filePath, 'utf8');
    return JSON.parse(file);
  } catch (error) {
    console.error('Failed to read showcase-examples.json:', error);
    return [];
  }
}

export default async function ShowcasePage() {
  const examples = await getShowcaseExamples();

  return (
    <Card className="border-dashed h-full flex flex-col">
      <CardHeader>
        <CardTitle>Edit Showcase Examples</CardTitle>
        <CardDescription>
          Modify the showcase examples displayed on the homepage.
        </CardDescription>
      </CardHeader>
      <ShowcaseEditor examples={examples} />
    </Card>
  );
}
