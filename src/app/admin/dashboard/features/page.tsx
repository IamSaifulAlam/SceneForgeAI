import { promises as fs } from 'fs';
import path from 'path';
import { Feature } from '@/lib/types';
import { FeaturesEditor } from '@/components/admin/features-editor';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

async function getFeatures(): Promise<Feature[]> {
  const filePath = path.join(process.cwd(), 'src', 'data', 'features.json');
  try {
    const file = await fs.readFile(filePath, 'utf8');
    return JSON.parse(file);
  } catch (error) {
    console.error('Failed to read features:', error);
    return [];
  }
}

export default async function FeaturesPage() {
  const features = await getFeatures();

  return (
    <Card className="border-dashed h-full flex flex-col">
      <CardHeader>
        <CardTitle>Edit Features</CardTitle>
        <CardDescription>
          Modify the features displayed on the homepage. Icons are from lucide-react.
        </CardDescription>
      </CardHeader>
      <FeaturesEditor features={features} />
    </Card>
  );
}
