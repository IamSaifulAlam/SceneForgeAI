import { promises as fs } from 'fs';
import path from 'path';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { SceneGenerator } from '@/components/scene-generator';
import type { Feature, HowToUseStep, ShowcaseExample, FaqItem } from '@/lib/types';
import { FeatureShowcase } from '@/components/feature-showcase';
import { HowToUse } from '@/components/how-to-use';
import { ExampleShowcase } from '@/components/example-showcase';
import { Faq } from '@/components/faq';

async function getData(fileName: string) {
  const filePath = path.join(process.cwd(), 'src', 'data', fileName);
  try {
    const file = await fs.readFile(filePath, 'utf8');
    if (!file) return fileName.includes('items') ? {} : [];
    return JSON.parse(file);
  } catch (error)
 {
    console.error(`Failed to read ${fileName}:`, error);
    if (fileName.includes('items')) return {};
    return [];
  }
}

export default async function Home() {
  const [
    features,
    formItems,
    howToUseSteps,
    showcaseExamples,
    faqItems,
  ] = await Promise.all([
    getData('features.json') as Promise<Feature[]>,
    getData('form-items.json') as Promise<Record<string, { label: string; prompt: string }[]>>,
    getData('how-to-use.json') as Promise<HowToUseStep[]>,
    getData('showcase-examples.json') as Promise<ShowcaseExample[]>,
    getData('faq.json') as Promise<FaqItem[]>,
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">
            SceneForge AI
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Craft compelling script scenes with the power of AI. From a spark of an idea to a full-fledged scene, let your creativity flow.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto mb-16 md:mb-24">
          <SceneGenerator
            formItems={formItems}
          />
        </div>

        <HowToUse steps={howToUseSteps} />
        
        <FeatureShowcase features={features} />

        <ExampleShowcase examples={showcaseExamples} />
        
        <Faq items={faqItems} />

      </main>
      <Footer />
    </div>
  );
}
