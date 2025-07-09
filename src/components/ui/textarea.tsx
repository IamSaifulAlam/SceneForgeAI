'use client';
import * as React from 'react';

import {cn} from '@/lib/utils';

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<'textarea'> & { wrapperClassName?: string }
>(({className, wrapperClassName, ...props}, ref) => {
  const textAreaRef = React.useRef<HTMLTextAreaElement>(null);
  React.useImperativeHandle(
    ref,
    () => textAreaRef.current as HTMLTextAreaElement
  );

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!textAreaRef.current) return;

    e.preventDefault();
    const startY = e.clientY;
    const startHeight = textAreaRef.current.clientHeight;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newHeight = startHeight + moveEvent.clientY - startY;
      if (textAreaRef.current) {
        // Apply a min-height to prevent it from becoming too small
        textAreaRef.current.style.height = `${Math.max(80, newHeight)}px`;
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className={cn("relative w-full", wrapperClassName)}>
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none pr-6',
          className
        )}
        ref={textAreaRef}
        {...props}
      />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="10"
        height="10"
        viewBox="0 0 11 11"
        fill="none"
        onMouseDown={handleMouseDown}
        className="custom-textarea-resizer"
      >
        <path
          d="M10 1v3c0 3.3-2.7 6-6 6h-3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
});
Textarea.displayName = 'Textarea';

export {Textarea};
