import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { DashboardProvider } from '@/components/admin/dashboard-provider';
import { headers } from 'next/headers';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    const heads = headers();
    const pathname = heads.get('next-url'); // Gets the full path, e.g., /admin/dashboard/users
    const redirectTo = pathname ? `?redirectTo=${encodeURIComponent(pathname)}` : '';
    redirect(`/admin${redirectTo}`);
  }

  return (
    <DashboardProvider>
      {children}
    </DashboardProvider>
  );
}
