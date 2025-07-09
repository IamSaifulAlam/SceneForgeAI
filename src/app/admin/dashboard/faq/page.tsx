import { promises as fs } from 'fs';
import path from 'path';
import { FaqItem } from '@/lib/types';
import { FaqEditor } from '@/components/admin/faq-editor';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

async function getFaqItems(): Promise<FaqItem[]> {
  const filePath = path.join(process.cwd(), 'src', 'data', 'faq.json');
  try {
    const file = await fs.readFile(filePath, 'utf8');
    return JSON.parse(file);
  } catch (error) {
    console.error('Failed to read faq.json:', error);
    return [];
  }
}

export default async function FaqPage() {
  const items = await getFaqItems();

  return (
    <Card className="border-dashed h-full flex flex-col">
      <CardHeader>
        <CardTitle>Edit FAQ</CardTitle>
        <CardDescription>
          Modify the questions and answers in the FAQ section.
        </CardDescription>
      </CardHeader>
      <FaqEditor items={items} />
    </Card>
  );
}
