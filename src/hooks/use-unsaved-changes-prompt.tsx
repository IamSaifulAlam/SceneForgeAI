'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface UnsavedChangesContextProps {
  isDirty: boolean;
  setIsDirty: (dirty: boolean) => void;
  promptNavigation: (path: string) => void;
}

const UnsavedChangesContext = createContext<UnsavedChangesContextProps | undefined>(undefined);

export function useUnsavedChangesPrompt() {
  const context = useContext(UnsavedChangesContext);
  if (!context) {
    throw new Error('useUnsavedChangesPrompt must be used within a UnsavedChangesProvider');
  }
  return context;
}

export function UnsavedChangesProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isDirty, setIsDirty] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [nextPath, setNextPath] = useState<string | null>(null);

  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);
  
  const promptNavigation = (path: string) => {
    if (isDirty) {
      setNextPath(path);
      setIsDialogOpen(true);
    } else {
      router.push(path);
    }
  };

  const handleConfirm = () => {
    if (nextPath) {
      // Temporarily disable the dirty flag to allow navigation
      setIsDirty(false); 
      // Use a timeout to ensure state update completes before navigation
      setTimeout(() => router.push(nextPath), 0);
    }
    setIsDialogOpen(false);
    setNextPath(null);
  };
  
  const handleCancel = () => {
    setIsDialogOpen(false);
    setNextPath(null);
  };

  return (
    <UnsavedChangesContext.Provider value={{ isDirty, setIsDirty, promptNavigation }}>
      {children}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>You have unsaved changes</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave? Your changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>Stay on page</AlertDialogCancel>
            <AlertDialogAction asChild>
                <Button onClick={handleConfirm} variant="destructive">Leave anyway</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </UnsavedChangesContext.Provider>
  );
}
