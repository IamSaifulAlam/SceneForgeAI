import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { Icons } from './icons';
import { Input } from './ui/input';
import { Button } from './ui/button';

export function Footer() {
  return (
    <footer className="border-t bg-black/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="flex flex-col space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Icons.logo className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold font-headline">{siteConfig.name}</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              {siteConfig.description}
            </p>
          </div>

          <div className="md:col-span-2 grid grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold tracking-wider text-foreground">PRODUCT</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">Features</Link></li>
                <li><Link href="#" className="hover:text-primary">Changelog</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold tracking-wider text-foreground">COMPANY</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">About Us</Link></li>
                <li><Link href="#" className="hover:text-primary">Contact</Link></li>
                <li><Link href="#" className="hover:text-primary">Careers</Link></li>
                <li><Link href="#" className="hover:text-primary">Blog</Link></li>
              </ul>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold tracking-wider text-foreground">NEWSLETTER</h3>
             <p className="mt-4 text-sm text-muted-foreground">
              Stay up to date with the latest features and releases.
            </p>
            <form className="mt-4 flex w-full max-w-sm items-center space-x-2">
              <Input type="email" placeholder="Email" />
              <Button type="submit">Subscribe</Button>
            </form>
          </div>

        </div>

        <div className="mt-8 border-t pt-6 flex flex-col items-center justify-center md:h-16 md:flex-row">
           <p className="text-balance text-center text-sm leading-loose text-muted-foreground">
             &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
           </p>
        </div>
      </div>
    </footer>
  );
}
