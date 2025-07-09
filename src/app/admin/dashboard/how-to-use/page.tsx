import { promises as fs } from 'fs';
import path from 'path';
import { HowToUseStep } from '@/lib/types';
import { HowToUseEditor } from '@/components/admin/how-to-use-editor';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

async function getHowToUseSteps(): Promise<HowToUseStep[]> {
  const filePath = path.join(process.cwd(), 'src', 'data', 'how-to-use.json');
  try {
    const file = await fs.readFile(filePath, 'utf8');
    return JSON.parse(file);
  } catch (error) {
    console.error('Failed to read how-to-use steps:', error);
    return [];
  }
}

export default async function HowToUsePage() {
  const steps = await getHowToUseSteps();

  return (
    <Card className="border-dashed h-full flex flex-col">
      <CardHeader>
        <CardTitle>Edit "How To Use" Steps</CardTitle>
        <CardDescription>
          Modify the instructional steps displayed on the homepage. Icons are from lucide-react.
        </CardDescription>
      </CardHeader>
      <HowToUseEditor steps={steps} />
    </Card>
  );
}
