'use client';
import { useActionState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CardContent, CardFooter } from '@/components/ui/card';
import { changeAdminPassword } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { useUnsavedChangesPrompt } from '@/hooks/use-unsaved-changes-prompt';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters long'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export function ProfileEditor() {
  const { toast } = useToast();
  const [state, formAction, isPending] = useActionState(changeAdminPassword, null);
  const { setIsDirty } = useUnsavedChangesPrompt();

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const { isDirty } = form.formState;

  useEffect(() => {
    setIsDirty(isDirty);
  }, [isDirty, setIsDirty]);

  const onSubmit = (data: PasswordFormValues) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formAction(formData);
    setIsDirty(false);
  };
  
  if (state?.success) {
    toast({
      title: 'Success!',
      description: state.message,
    });
    form.reset();
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
        <CardContent className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 max-w-2xl">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div/>
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
        <CardFooter className="border-t p-6 flex justify-end gap-2">
           <Button variant="outline" type="button" onClick={() => form.reset()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending || !isDirty}>
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
}
