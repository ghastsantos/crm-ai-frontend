import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          'flex h-9 w-full rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm text-zinc-900 shadow-sm outline-none transition-colors',
          'placeholder:text-zinc-400',
          'focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-200',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500',
          'dark:focus-visible:border-zinc-600 dark:focus-visible:ring-zinc-700',
          className
        )}
        {...props}
      />
    );
  }
);
