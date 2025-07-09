'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { siteConfig } from '@/config/site';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { adminLogout } from '@/lib/actions';
import { LayoutDashboard, FileJson, Sparkles, LogOut, Home, Settings, KeyRound, ClipboardList, BookOpenCheck, GalleryVerticalEnd, MessageCircleQuestion, BarChart3, Users } from 'lucide-react';
import { useUnsavedChangesPrompt } from '@/hooks/use-unsaved-changes-prompt';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/dashboard/users', label: 'Users', icon: Users },
  { href: '/admin/dashboard/site-settings', label: 'Site Settings', icon: Settings },
  { href: '/admin/dashboard/features', label: 'Features', icon: Sparkles },
  { href: '/admin/dashboard/how-to-use', label: 'How To Use', icon: BookOpenCheck },
  { href: '/admin/dashboard/showcase', label: 'Showcase', icon: GalleryVerticalEnd },
  { href: '/admin/dashboard/faq', label: 'FAQ', icon: MessageCircleQuestion },
  { href: '/admin/dashboard/form-items', label: 'Form Items', icon: FileJson },
  { href: '/admin/dashboard/prompt-settings', label: 'Prompt Template', icon: ClipboardList },
];

export function Sidebar() {
  const pathname = usePathname();
  const { promptNavigation } = useUnsavedChangesPrompt();

  const handleNav = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    promptNavigation(href);
  };
  
  return (
    <aside className="hidden w-64 flex-col border-r bg-background sm:flex">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Icons.logo className="h-6 w-6 text-primary" />
          <span>{siteConfig.name}</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-2 p-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={(e) => handleNav(e, item.href)}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
              (pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href))) && 'bg-muted text-primary'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto p-4 border-t">
        <Link href="/" onClick={(e) => handleNav(e, '/')}>
           <Button variant="ghost" className="w-full justify-start mb-2">
              <Home className="mr-2 h-4 w-4" />
              Back to Site
           </Button>
        </Link>
        <Link href="/admin/dashboard/profile" onClick={(e) => handleNav(e, '/admin/dashboard/profile')}>
           <Button variant="ghost" className="w-full justify-start mb-2">
              <KeyRound className="mr-2 h-4 w-4" />
              Edit Profile
           </Button>
        </Link>
        <form action={adminLogout}>
          <Button variant="ghost" className="w-full justify-start">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </form>
      </div>
    </aside>
  );
}
