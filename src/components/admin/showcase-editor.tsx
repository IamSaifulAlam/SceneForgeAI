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
import { saveShowcaseExamples } from '@/lib/actions';
import { Trash, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useUnsavedChangesPrompt } from '@/hooks/use-unsaved-changes-prompt';
import type { ShowcaseExample } from '@/lib/types';

const showcaseExampleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  attributes: z.string().min(1, 'Provide at least one attribute'), // Stored as comma-separated string in form
});

const showcaseFormSchema = z.object({
  examples: z.array(showcaseExampleSchema),
});

type ShowcaseFormValues = z.infer<typeof showcaseFormSchema>;

interface ShowcaseEditorProps {
  examples: ShowcaseExample[];
}

// Convert attributes array to comma-separated string for form
const toFormShape = (data: ShowcaseExample[]): ShowcaseFormValues['examples'] => {
  return data.map(ex => ({ ...ex, attributes: ex.attributes.join(', ') }));
};

export function ShowcaseEditor({ examples }: ShowcaseEditorProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [state, formAction, isPending] = useActionState(saveShowcaseExamples, null);
  const { setIsDirty } = useUnsavedChangesPrompt();

  const form = useForm<ShowcaseFormValues>({
    resolver: zodResolver(showcaseFormSchema),
    defaultValues: {
      examples: toFormShape(examples) || [],
    },
  });

  const { isDirty } = form.formState;

  useEffect(() => {
    setIsDirty(isDirty);
  }, [isDirty, setIsDirty]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'examples',
  });

  const onSubmit = (data: ShowcaseFormValues) => {
    const formData = new FormData();
    formData.append('examples', JSON.stringify(data.examples));
    formAction(formData);
    setIsDirty(false); 
  };
  
  if (state?.success) {
    toast({
      title: 'Success!',
      description: 'Showcase examples have been saved.',
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
                  <CardTitle>Example #{index + 1}</CardTitle>
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
                    name={`examples.${index}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Cyberpunk Detective" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name={`examples.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`examples.${index}.attributes`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Attributes (comma-separated)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Sci-Fi, Contemplative, Space" />
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
            onClick={() => append({ title: '', description: '', attributes: '' })}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Example
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
