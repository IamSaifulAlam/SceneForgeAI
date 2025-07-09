'use client';
import { useActionState, useEffect, useRef, useState } from 'react';
import { adminLogin } from '@/lib/actions';
import { siteConfig } from '@/config/site';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning, Admin';
  if (hour < 18) return 'Good afternoon, Admin';
  return 'Good evening, Admin';
};

export function LoginForm({ redirectTo }: { redirectTo: string | null }) {
  const { toast } = useToast();
  const [state, formAction, isPending] = useActionState(adminLogin, null);
  const [greeting, setGreeting] = useState('');
  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setGreeting(getGreeting());
    passwordInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (state?.success === false) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-8 text-center">
        <h1 className="text-2xl font-bold font-headline text-primary">
          {siteConfig.name}
        </h1>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{greeting || 'Welcome, Admin'}</CardTitle>
          <CardDescription>Please enter the password to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                ref={passwordInputRef}
                id="password"
                name="password"
                type="password"
                required
              />
            </div>
             {state?.success === false && (
              <p className="text-sm text-destructive">{state.message}</p>
            )}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
