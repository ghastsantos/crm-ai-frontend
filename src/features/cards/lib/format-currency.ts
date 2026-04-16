const DEFAULT_CURRENCY = 'BRL';

export function formatCurrency(value: number | null): string {
  if (value == null) return '—';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: DEFAULT_CURRENCY,
  }).format(value);
}
