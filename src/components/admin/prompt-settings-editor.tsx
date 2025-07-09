'use client';

import React, { useActionState, useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { savePromptTemplate } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useUnsavedChangesPrompt } from '@/hooks/use-unsaved-changes-prompt';
import { cn } from '@/lib/utils';
import { useForm, useWatch } from 'react-hook-form';
import { snakeToCamel } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormLabel } from '../ui/form';
import { Textarea } from '../ui/textarea';
import { CustomSelect } from '../ui/custom-select';

interface PromptSettingsEditorProps {
  template: string;
  formItems: Record<string, { label: string; prompt: string }[]>;
}

export function PromptSettingsEditor({ template: initialTemplate, formItems }: PromptSettingsEditorProps) {
  const { toast } = useToast();
  const [state, formAction, isPending] = useActionState(savePromptTemplate, null);
  const { isDirty, setIsDirty } = useUnsavedChangesPrompt();
  
  const editorRef = useRef<HTMLDivElement>(null);
  const cleanContentRef = useRef(initialTemplate);
  const [templateContent, setTemplateContent] = useState(initialTemplate);

  const form = useForm({
    defaultValues: {
      sceneDescription: 'A lone astronaut watches her home planet shrink from a porthole.',
      ...Object.entries(formItems).reduce((acc, [key, items]) => {
          const camelKey = snakeToCamel(key);
          acc[camelKey] = items.length > 0 ? items[0].prompt : '';
          return acc;
      }, {} as Record<string, string>)
    },
  });

  const watchedValues = useWatch({ control: form.control });
  const [livePreview, setLivePreview] = useState('');

  useEffect(() => {
    let preview = templateContent;

    const allValues = { ...watchedValues, selectedLanguage: watchedValues.language };
    
    // Replace all placeholders like {{{placeholder}}}
    preview = preview.replace(/{{{([^}]+)}}}/g, (match, key) => {
      return (allValues as any)[key] || '';
    });
    
    // Handle conditional blocks like {{#if location}}...{{/if}}
    preview = preview.replace(/{{#if (\w+)}}(.*?){{\/if}}/gs, (match, key, content) => {
        const value = (allValues as any)[key];
        if (value) {
            return content.replace(new RegExp(`{{{${key}}}}`, 'g'), value);
        }
        return '';
    });
    
    preview = preview.split('\n').filter(line => line.trim() !== '' || line.includes('**')).join('\n');

    setLivePreview(preview);

  }, [watchedValues, templateContent, formItems]);


  useEffect(() => {
    if (editorRef.current && editorRef.current.textContent !== initialTemplate) {
        editorRef.current.textContent = initialTemplate;
        cleanContentRef.current = initialTemplate;
        setTemplateContent(initialTemplate);
        setIsDirty(false);
    }
  }, [initialTemplate, setIsDirty]);

  useEffect(() => {
    if (editorRef.current && !editorRef.current.textContent) {
      editorRef.current.textContent = initialTemplate;
    }
  }, [initialTemplate]);

  useEffect(() => {
    if (state?.success) {
      toast({ title: 'Success!', description: 'Prompt template saved successfully.' });
      if(editorRef.current) {
        cleanContentRef.current = editorRef.current.textContent || '';
      }
      setIsDirty(false);
    }
    if (state?.success === false) {
      toast({ variant: 'destructive', title: 'Error', description: state.message });
    }
  }, [state, toast, setIsDirty]);
  
  const handleInput = () => {
    if (editorRef.current) {
      const currentContent = editorRef.current.textContent || '';
      setTemplateContent(currentContent);
      setIsDirty(currentContent !== cleanContentRef.current);
    }
  };

  const handleSave = () => {
    if (editorRef.current) {
        const contentToSave = editorRef.current.textContent || '';
        const formData = new FormData();
        formData.append('template', contentToSave);
        formAction(formData);
    }
  };

  const handleCancel = () => {
    if (editorRef.current) {
        editorRef.current.textContent = cleanContentRef.current;
        setTemplateContent(cleanContentRef.current);
        setIsDirty(false);
    }
  };

  return (
    <React.Fragment>
      <CardContent className="flex-1 grid md:grid-cols-2 gap-6 p-6 min-h-0">
        <div className="flex flex-col min-h-0">
          <ScrollArea className="flex-1 rounded-md border bg-background">
            <div
              ref={editorRef}
              contentEditable={true}
              onInput={handleInput}
              suppressContentEditableWarning={true}
              className={cn(
                "w-full h-full min-h-[400px] text-sm font-mono whitespace-pre-wrap p-4",
                "focus-visible:outline-none"
              )}
            />
          </ScrollArea>
        </div>
        <Card className="flex flex-col h-full border-dashed overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl">Live Preview Controls</CardTitle>
            <CardDescription>
              Adjust these options to see how your template will render with real data.
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <CardContent className="flex-1 overflow-y-auto p-4 pt-0 space-y-4">
                <FormField
                    control={form.control}
                    name="sceneDescription"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Sample Scene Description</FormLabel>
                            <FormControl>
                                <Textarea {...field} rows={3} />
                            </FormControl>
                        </FormItem>
                    )}
                />
                {Object.entries(formItems).map(([key, items]) => {
                    const camelKey = snakeToCamel(key) as any;
                    const comboboxOptions = items.map(opt => ({ value: opt.prompt, label: opt.label }));
                    return (
                        <FormField
                            key={key}
                            control={form.control}
                            name={camelKey}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{key.charAt(0).toUpperCase() + key.slice(1)}</FormLabel>
                                    <CustomSelect
                                    options={comboboxOptions}
                                    value={field.value || ''}
                                    onChange={field.onChange}
                                    placeholder={`Select ${key}...`}
                                    />
                                </FormItem>
                            )}
                        />
                    )
                })}
            </CardContent>
          </Form>
           <CardFooter className="p-4 border-t flex flex-col items-start gap-2">
            <h4 className="font-semibold">Live Rendered Prompt</h4>
            <ScrollArea className="h-48 w-full rounded-md bg-muted/30 p-2">
                <pre className="text-xs whitespace-pre-wrap font-mono">{livePreview}</pre>
            </ScrollArea>
          </CardFooter>
        </Card>
      </CardContent>
      <CardFooter className="border-t p-6 flex justify-end gap-2">
        <Button variant="outline" onClick={handleCancel} disabled={!isDirty || isPending}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!isDirty || isPending}>
          {isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardFooter>
    </React.Fragment>
  );
}
