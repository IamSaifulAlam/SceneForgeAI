'use client';
import { useActionState, useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { saveFaqItems } from '@/lib/actions';
import { Trash, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useUnsavedChangesPrompt } from '@/hooks/use-unsaved-changes-prompt';

const faqItemSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  answer: z.string().min(1, 'Answer is required'),
});

const faqFormSchema = z.object({
  items: z.array(faqItemSchema),
});

type FaqFormValues = z.infer<typeof faqFormSchema>;

interface FaqEditorProps {
  items: FaqFormValues['items'];
}

export function FaqEditor({ items }: FaqEditorProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [state, formAction, isPending] = useActionState(saveFaqItems, null);
  const { setIsDirty } = useUnsavedChangesPrompt();

  const form = useForm<FaqFormValues>({
    resolver: zodResolver(faqFormSchema),
    defaultValues: {
      items: items || [],
    },
  });

  const { isDirty } = form.formState;

  useEffect(() => {
    setIsDirty(isDirty);
  }, [isDirty, setIsDirty]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const onSubmit = (data: FaqFormValues) => {
    const formData = new FormData();
    formData.append('items', JSON.stringify(data.items));
    formAction(formData);
    setIsDirty(false); 
  };
  
  if (state?.success) {
    toast({
      title: 'Success!',
      description: 'FAQ items have been saved.',
    });
    router.refresh();
  }
   if (state?.success === false) {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: state.message,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0">
        <CardContent className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {fields.map((field, index) => (
              <Card key={field.id} className="relative flex flex-col">
                <CardHeader>
                  <CardTitle>FAQ #{index + 1}</CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4"
                    onClick={() => remove(index)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4 flex-1">
                  <FormField
                    control={form.control}
                    name={`items.${index}.question`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Question</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`items.${index}.answer`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Answer</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>

        <CardFooter className="border-t p-6 flex justify-between items-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => append({ question: '', answer: '' })}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add FAQ Item
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !isDirty}>
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Form>
  );
}
