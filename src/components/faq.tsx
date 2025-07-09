import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import type { FaqItem } from "@/lib/types";

interface FaqProps {
  items: FaqItem[];
}

export function Faq({ items }: FaqProps) {
  if (!items || items.length === 0) return null;

  return (
    <section className="py-16 md:py-24">
       <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-headline font-bold tracking-tighter">Frequently Asked Questions</h2>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Have questions? We have answers. If you don't see your question here, feel free to reach out.</p>
      </div>
      <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
        {items.map((item, index) => (
          <AccordionItem value={`item-${index}`} key={index}>
            <AccordionTrigger className="text-left font-headline text-lg">{item.question}</AccordionTrigger>
            <AccordionContent className="text-base text-muted-foreground">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
