import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import * as LucideIcons from 'lucide-react';
import type { HowToUseStep } from '@/lib/types';

interface HowToUseProps {
  steps: HowToUseStep[];
}

function isLucideIcon(key: string): key is keyof typeof LucideIcons {
  return key in LucideIcons;
}

export function HowToUse({ steps }: HowToUseProps) {
  if (!steps || steps.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-white/[.10] rounded-lg card-gradient-border">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-headline font-bold tracking-tighter">How It Works</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">A simple, six-step process to bring your cinematic vision to life.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const IconComponent = isLucideIcon(step.icon)
              ? LucideIcons[step.icon]
              : LucideIcons.Sparkles;

            return (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary border-2 border-primary/20 mb-4">
                  <IconComponent className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-headline font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
