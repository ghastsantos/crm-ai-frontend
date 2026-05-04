import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { Input } from './input';

type MoneyInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'type' | 'inputMode'
> & {
  value: string;
  onValueChange: (next: string) => void;
};

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function tryFormat(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed === '') return '';
  if (!/^\d+([.,]\d{1,2})?$/.test(trimmed)) return null;
  const parsed = Number(trimmed.replace(',', '.'));
  if (Number.isNaN(parsed)) return null;
  return BRL.format(parsed);
}

export const MoneyInput = forwardRef<HTMLInputElement, MoneyInputProps>(function MoneyInput(
  { value, onValueChange, placeholder, onFocus, onBlur, ...props },
  ref
) {
  const [focused, setFocused] = useState(false);

  const formatted = !focused && value !== '' ? tryFormat(value) : null;
  const display = focused ? value : (formatted ?? value);

  return (
    <Input
      {...props}
      ref={ref}
      inputMode="decimal"
      placeholder={placeholder ?? 'R$ 0,00'}
      value={display}
      onChange={(e) => onValueChange(e.target.value)}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
    />
  );
});
