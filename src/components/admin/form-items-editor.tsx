'use client';
import { useActionState, useState, useEffect } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormItem, FormLabel } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { saveFormItems } from '@/lib/actions';
import { Trash, PlusCircle, ChevronsUpDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useUnsavedChangesPrompt } from '@/hooks/use-unsaved-changes-prompt';
import { cn } from '@/lib/utils';

const formItemsSchema = z.object({
  formItems: z.array(z.object({
    category: z.string().min(1, "Category name cannot be empty"),
    items: z.array(z.object({
      label: z.string().min(1, "Label value cannot be empty"),
      prompt: z.string().min(1, "Prompt value cannot be empty"),
    })).min(1, "Category must have at least one item."),
  }))
});

type FormItemsValues = z.infer<typeof formItemsSchema>;

interface FormItemsEditorProps {
  formItems: Record<string, { label: string; prompt: string }[]>;
}

const toFormShape = (items: Record<string, { label: string; prompt: string }[]>): FormItemsValues['formItems'] => {
  return Object.entries(items).map(([category, values]) => ({
    category,
    items: values.map(value => ({ label: value.label, prompt: value.prompt }))
  }));
};

const fromFormShape = (items: FormItemsValues['formItems']): Record<string, { label: string; prompt: string }[]> => {
  return items.reduce((acc, { category, items }) => {
    acc[category] = items.map(item => ({ label: item.label, prompt: item.prompt }));
    return acc;
  }, {} as Record<string, { label: string; prompt: string }[]>);
};

export function FormItemsEditor({ formItems: initialFormItems }: FormItemsEditorProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [state, formAction, isPending] = useActionState(saveFormItems, null);
  const { setIsDirty } = useUnsavedChangesPrompt();
  
  const form = useForm<FormItemsValues>({
    resolver: zodResolver(formItemsSchema),
    defaultValues: {
      formItems: toFormShape(initialFormItems),
    },
  });

  const { isDirty } = form.formState;

  useEffect(() => {
    setIsDirty(isDirty);
  }, [isDirty, setIsDirty]);

  const { fields: formItemFields, append: appendFormItem, remove: removeFormItem } = useFieldArray({ control: form.control, name: 'formItems' });
  
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleAddCategory = () => {
    const trimmedName = newCategoryName.trim();
    if (trimmedName && !formItemFields.some(f => f.category.toLowerCase() === trimmedName.toLowerCase())) {
      appendFormItem({ category: trimmedName, items: [{label: 'Default', prompt: 'default'}] });
      setNewCategoryName('');
      setIsAddCategoryOpen(false);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Category name is empty or already exists.',
      });
    }
  };
  
  const onSubmit = (data: FormItemsValues) => {
    const formData = new FormData();
    formData.append('formItems', JSON.stringify(fromFormShape(data.formItems)));
    formAction(formData);
    setIsDirty(false);
  };
  
  if (state?.success) {
    toast({ title: 'Success!', description: 'Form items have been saved.' });
    router.refresh();
  }
  if (state?.success === false) {
    toast({ variant: 'destructive', title: 'Error', description: state.message });
  }

  const half = Math.ceil(formItemFields.length / 2);
  const leftColumnFields = formItemFields.slice(0, half);
  const rightColumnFields = formItemFields.slice(half);
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0">
        <CardContent className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
            <div className="flex flex-col gap-4">
              {leftColumnFields.map((field, index) => {
                const categoryIndex = index;
                return (
                  <Accordion type="single" collapsible className="w-full" key={field.id}>
                    <AccordionItem value={field.id} className="border rounded-lg bg-background">
                      <AccordionTrigger className="px-4 py-2 hover:no-underline">
                        <div className="flex items-center justify-between w-full">
                           <div className="flex items-center gap-2">
                             <ChevronsUpDown className="h-5 w-5 text-muted-foreground" />
                             <span className="font-bold text-lg">{useWatch({ control: form.control, name: `formItems.${categoryIndex}.category` })}</span>
                           </div>
                            <div
                              role="button"
                              aria-label="Remove category"
                              tabIndex={0}
                              className={cn(
                                buttonVariants({ variant: 'ghost', size: 'icon' }),
                                'hover:bg-destructive/10 z-10'
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFormItem(categoryIndex);
                              }}
                              onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      removeFormItem(categoryIndex);
                                  }
                              }}
                            >
                              <Trash className="h-4 w-4 text-destructive" />
                            </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <CategoryEditor categoryIndex={categoryIndex} control={form.control} />
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )
              })}
            </div>
             <div className="flex flex-col gap-4">
              {rightColumnFields.map((field, index) => {
                const categoryIndex = half + index;
                return (
                  <Accordion type="single" collapsible className="w-full" key={field.id}>
                    <AccordionItem value={field.id} className="border rounded-lg bg-background">
                      <AccordionTrigger className="px-4 py-2 hover:no-underline">
                        <div className="flex items-center justify-between w-full">
                           <div className="flex items-center gap-2">
                             <ChevronsUpDown className="h-5 w-5 text-muted-foreground" />
                             <span className="font-bold text-lg">{useWatch({ control: form.control, name: `formItems.${categoryIndex}.category` })}</span>
                           </div>
                            <div
                              role="button"
                              aria-label="Remove category"
                              tabIndex={0}
                              className={cn(
                                buttonVariants({ variant: 'ghost', size: 'icon' }),
                                'hover:bg-destructive/10 z-10'
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFormItem(categoryIndex);
                              }}
                              onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      removeFormItem(categoryIndex);
                                  }
                              }}
                            >
                              <Trash className="h-4 w-4 text-destructive" />
                            </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <CategoryEditor categoryIndex={categoryIndex} control={form.control} />
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )
              })}
            </div>
          </div>
        </CardContent>

        <CardFooter className="border-t p-6 flex justify-between items-center">
          <Button type="button" variant="outline" onClick={() => setIsAddCategoryOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Category
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" type="button" onClick={() => form.reset()}>Cancel</Button>
            <Button type="submit" disabled={isPending || !isDirty}>{isPending ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        </CardFooter>
      </form>
      <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
                <DialogDescription>
                    Enter a name for the new option category (e.g., 'Costumes').
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
                <Input 
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="New category name..."
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                />
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddCategoryOpen(false)}>Cancel</Button>
                <Button onClick={handleAddCategory}>Add Category</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </Form>
  );
}

function CategoryEditor({ categoryIndex, control }: { categoryIndex: number; control: any }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `formItems.${categoryIndex}.items`,
  });

  return (
    <div className="space-y-3 pt-2 border-t">
      {fields.map((item, itemIndex) => (
        <div key={item.id} className="grid grid-cols-1 md:grid-cols-[1fr,1fr,auto] items-center gap-2">
          <Input 
            {...control.register(`formItems.${categoryIndex}.items.${itemIndex}.label`)}
            placeholder="Label (e.g. 'Golden Hour')"
          />
           <Input 
            {...control.register(`formItems.${categoryIndex}.items.${itemIndex}.prompt`)}
            placeholder="Prompt (e.g. 'bathed in warm golden hour light')"
          />
          <Button type="button" variant="ghost" size="icon" onClick={() => remove(itemIndex)}>
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append({ label: '', prompt: '' })}
      >
        <PlusCircle className="mr-2 h-4 w-4" /> Add Item
      </Button>
    </div>
  );
}
