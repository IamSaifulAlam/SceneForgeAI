
"use client";

import Autoplay from "embla-carousel-autoplay";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import type { ShowcaseExample } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

interface ExampleShowcaseProps {
  examples: ShowcaseExample[];
}

export function ExampleShowcase({ examples }: ExampleShowcaseProps) {
  if (!examples || examples.length === 0) return null;

  return (
    <section className="py-16 md:py-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-headline font-bold tracking-tighter">See What's Possible</h2>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Explore pre-generated examples to spark your imagination.</p>
      </div>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 4000,
            stopOnInteraction: false,
            stopOnMouseEnter: true,
          }),
        ]}
        className="w-full max-w-6xl mx-auto"
      >
        <CarouselContent className="-ml-4">
          {examples.map((example, index) => (
            <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
              <div className="p-1">
                <Card className="h-full flex flex-col bg-card/50 hover:border-primary/50 transition-colors duration-300">
                  <CardHeader>
                    <CardTitle className="font-headline text-xl">{example.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <p className="text-muted-foreground mb-4">{example.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {example.attributes.map((attr) => (
                        <Badge key={attr} variant="secondary">{attr}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </section>
  );
}
