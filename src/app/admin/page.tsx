import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LoginForm } from './login-form';

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await getSession();

  // This handles the two cases:
  // 1. A user is already logged in and navigates to /admin. They should be sent to the dashboard.
  // 2. A user is not logged in and is redirected here from a protected route.
  //    The `redirectTo` param will be passed to the login form.
  if (session) {
    redirect('/admin/dashboard');
  }

  const redirectTo =
    typeof searchParams.redirectTo === 'string'
      ? searchParams.redirectTo
      : null;

  return <LoginForm redirectTo={redirectTo} />;
}
