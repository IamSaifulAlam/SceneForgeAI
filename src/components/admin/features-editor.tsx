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
import { saveFeatures } from '@/lib/actions';
import { Trash, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useUnsavedChangesPrompt } from '@/hooks/use-unsaved-changes-prompt';

const featureSchema = z.object({
  icon: z.string().min(1, 'Icon is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
});

const featuresFormSchema = z.object({
  features: z.array(featureSchema),
});

type FeaturesFormValues = z.infer<typeof featuresFormSchema>;

interface FeaturesEditorProps {
  features: FeaturesFormValues['features'];
}

export function FeaturesEditor({ features }: FeaturesEditorProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [state, formAction, isPending] = useActionState(saveFeatures, null);
  const { setIsDirty } = useUnsavedChangesPrompt();

  const form = useForm<FeaturesFormValues>({
    resolver: zodResolver(featuresFormSchema),
    defaultValues: {
      features: features || [],
    },
  });

  const { isDirty } = form.formState;

  useEffect(() => {
    setIsDirty(isDirty);
  }, [isDirty, setIsDirty]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'features',
  });

  const onSubmit = (data: FeaturesFormValues) => {
    const formData = new FormData();
    formData.append('features', JSON.stringify(data.features));
    formAction(formData);
    setIsDirty(false); 
  };
  
  if (state?.success) {
    toast({
      title: 'Success!',
      description: 'Features have been saved.',
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
                  <CardTitle>Feature #{index + 1}</CardTitle>
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
                    name={`features.${index}.icon`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lucide Icon Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Sparkles" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`features.${index}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., AI-Powered Scenes" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`features.${index}.description`}
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
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>

        <CardFooter className="border-t p-6 flex justify-between items-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => append({ icon: '', title: '', description: '' })}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Feature
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
