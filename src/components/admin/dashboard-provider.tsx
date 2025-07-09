'use client';
import { UnsavedChangesProvider } from '@/hooks/use-unsaved-changes-prompt';
import { Sidebar } from '@/components/admin/sidebar';

export function DashboardProvider({ children }: { children: React.ReactNode }) {
    return (
        <UnsavedChangesProvider>
            <div className="flex h-screen bg-muted/40">
                <Sidebar />
                <main className="flex-1 flex flex-col p-4 sm:p-6 md:p-8 overflow-hidden">
                    {children}
                </main>
            </div>
        </UnsavedChangesProvider>
    );
}
