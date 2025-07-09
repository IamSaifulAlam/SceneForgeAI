'use client';
import { useActionState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { saveSiteSettings } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { useUnsavedChangesPrompt } from '@/hooks/use-unsaved-changes-prompt';
import { Switch } from '../ui/switch';

const siteSettingsSchema = z.object({
  siteName: z.string().min(1, 'Site name is required'),
  siteDescription: z.string().min(1, 'Site description is required'),
  enableShrinkingHeader: z.boolean(),
  headerMaxHeight: z.coerce.number().min(40, 'Min height must be at least 40px'),
  headerMinHeight: z.coerce.number().min(40, 'Min height must be at least 40px'),
  lightBackground: z.string().min(1, 'Required'),
  lightPrimary: z.string().min(1, 'Required'),
  lightAccent: z.string().min(1, 'Required'),
  darkBackground: z.string().min(1, 'Required'),
  darkPrimary: z.string().min(1, 'Required'),
  darkAccent: z.string().min(1, 'Required'),
});

type SiteSettingsFormValues = z.infer<typeof siteSettingsSchema>;

interface SiteSettingsEditorProps {
  settings: SiteSettingsFormValues;
}

export function SiteSettingsEditor({ settings }: SiteSettingsEditorProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [state, formAction, isPending] = useActionState(saveSiteSettings, null);
  const { setIsDirty } = useUnsavedChangesPrompt();

  const form = useForm<SiteSettingsFormValues>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: settings,
  });

  const { isDirty } = form.formState;

  useEffect(() => {
    setIsDirty(isDirty);
  }, [isDirty, setIsDirty]);

  const onSubmit = (data: SiteSettingsFormValues) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    formAction(formData);
    setIsDirty(false);
  };
  
  if (state?.success) {
    toast({
      title: 'Success!',
      description: 'Settings have been saved. Refresh may be needed to see color changes.',
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
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
            <Card>
              <CardHeader><CardTitle>Branding</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="siteName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site Name</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="siteDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site Description</FormLabel>
                      <FormControl><Textarea {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Theme Colors</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <FormDescription>
                    Enter colors as HSL values without the 'hsl()' wrapper (e.g., '0 0% 100%').
                </FormDescription>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4">
                  <div className="space-y-4">
                      <h3 className="font-medium mb-2">Light Mode</h3>
                      <FormField control={form.control} name="lightBackground" render={({ field }) => (<FormItem><FormLabel>Background</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="lightPrimary" render={({ field }) => (<FormItem><FormLabel>Primary</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="lightAccent" render={({ field }) => (<FormItem><FormLabel>Accent</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                  <div className="space-y-4">
                      <h3 className="font-medium mb-2">Dark Mode</h3>
                      <FormField control={form.control} name="darkBackground" render={({ field }) => (<FormItem><FormLabel>Background</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="darkPrimary" render={({ field }) => (<FormItem><FormLabel>Primary</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="darkAccent" render={({ field }) => (<FormItem><FormLabel>Accent</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><CardTitle>Header Settings</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="enableShrinkingHeader"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Shrinking Header</FormLabel>
                      <FormDescription>
                        Enable a dynamic header that shrinks on scroll.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="headerMaxHeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Height (px)</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="headerMinHeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min Height (px)</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </CardContent>
        <CardFooter className="border-t p-6 flex justify-end gap-2">
          <Button variant="outline" type="button" onClick={() => form.reset()}>Cancel</Button>
          <Button type="submit" disabled={isPending || !isDirty}>{isPending ? 'Saving...' : 'Save Changes'}</Button>
        </CardFooter>
      </form>
    </Form>
  );
}
