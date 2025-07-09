import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm overflow-hidden">
        <CardContent className="p-6">
          <div className="relative h-32 w-full">
            <div className="absolute bottom-0 left-0 h-8 w-8 animate-bounce-block rounded-full bg-foreground" />
            <div className="absolute top-0 bottom-0 left-1/2 w-px -translate-x-1/2 bg-border/20" />
          </div>
        </CardContent>
      </Card>
      <div className="mt-8 text-center">
        <h1 className="text-4xl font-bold font-headline tracking-tighter">404 - Page Not Found</h1>
        <p className="mt-2 text-muted-foreground max-w-xs mx-auto">
          It seems the page you are looking for is stuck somewhere else.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Go to Homepage
          </Link>
        </Button>
      </div>
    </div>
  );
}
