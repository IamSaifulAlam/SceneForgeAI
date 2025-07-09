'use client';

import { siteConfig } from '@/config/site';
import { Icons } from './icons';
import { useEffect, useState } from 'react';

const {
  enableShrinkingHeader,
  headerMaxHeight,
  headerMinHeight,
} = siteConfig;

const SCROLL_RANGE = 100; // The scroll distance (in px) over which the header shrinks.

export function Header() {
  const [height, setHeight] = useState(enableShrinkingHeader ? headerMaxHeight : headerMinHeight);

  useEffect(() => {
    if (!enableShrinkingHeader) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heightDifference = headerMaxHeight - headerMinHeight;
      
      const scrollFraction = Math.min(scrollY / SCROLL_RANGE, 1);
      
      const newHeight = headerMaxHeight - heightDifference * scrollFraction;
      
      setHeight(newHeight);
    };

    window.addEventListener('scroll', handleScroll);
    
    // Initial call to set height based on initial scroll position
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []); // Empty dependency array ensures this runs once on mount

  return (
    <header 
      className="sticky top-0 z-50 w-full header-gradient-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-[height] duration-100 ease-out"
      style={{ height: `${height}px` }}
    >
      <div className="container flex h-full max-w-screen-2xl items-center">
        <div className="mr-4 flex items-center">
          <a href="/" className="mr-2 flex items-center space-x-2">
            <Icons.logo className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline">{siteConfig.name}</span>
          </a>
        </div>
      </div>
    </header>
  );
}
