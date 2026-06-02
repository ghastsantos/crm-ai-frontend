import { forwardRef, type InputHTMLAttributes } from 'react';
import { IMaskInput } from 'react-imask';
import { cn } from '@/shared/lib/cn';

const baseClassName = cn(
  'flex h-9 w-full rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm text-zinc-900 shadow-sm outline-none transition-colors',
  'placeholder:text-zinc-400',
  'focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-200',
  'disabled:cursor-not-allowed disabled:opacity-50',
  'dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500',
  'dark:focus-visible:border-zinc-600 dark:focus-visible:ring-zinc-700'
);

type PhoneInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'type'
> & {
  value: string;
  onValueChange: (next: string) => void;
};

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(function PhoneInput(
  { value, onValueChange, className, placeholder, ...props },
  ref
) {
  return (
    <IMaskInput
      mask={[{ mask: '(00) 00000-0000' }, { mask: '+00 (00) 00000-0000' }]}
      dispatch={(appended, dynamicMasked) => {
        const next = (dynamicMasked.value + appended).trim();
        const masks = dynamicMasked.compiledMasks;
        if (next.startsWith('+')) return masks[1];
        return masks[0];
      }}
      type="tel"
      autoComplete="tel"
      placeholder={placeholder ?? '+55 (11) 91234-5678'}
      value={value}
      onAccept={(next: unknown) => onValueChange(String(next ?? ''))}
      inputRef={ref as React.RefCallback<HTMLInputElement>}
      className={cn(baseClassName, className)}
      {...props}
    />
  );
});
