import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import * as LucideIcons from 'lucide-react';
import type { Feature } from '@/lib/types';

interface FeatureShowcaseProps {
  features: Feature[];
}

// A type guard to check if a key is a valid Lucide icon name
function isLucideIcon(key: string): key is keyof typeof LucideIcons {
  return key in LucideIcons;
}

export function FeatureShowcase({ features }: FeatureShowcaseProps) {
  return (
    <section className="py-16 md:py-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-headline font-bold tracking-tighter">Why Choose SceneForge AI?</h2>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Discover the features that make us the best tool for modern storytellers.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => {
          const IconComponent = isLucideIcon(feature.icon)
            ? LucideIcons[feature.icon]
            : LucideIcons.Sparkles; // Fallback icon

          return (
            <Card key={index} className="bg-card/50 hover:border-primary/50 transition-colors duration-300">
              <CardHeader className="flex flex-row items-center gap-4">
                <IconComponent className="h-8 w-8 text-primary" />
                <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
