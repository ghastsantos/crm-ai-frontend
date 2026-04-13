const currencyFormatters = new Map<string, Intl.NumberFormat>();

function getCurrencyFormatter(currency: string): Intl.NumberFormat {
  let formatter = currencyFormatters.get(currency);

  if (!formatter) {
    try {
      formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency,
      });
    } catch (err) {
      console.warn(`[formatCurrency] Moeda inválida "${currency}", usando fallback sem símbolo.`, err);
      formatter = new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    currencyFormatters.set(currency, formatter);
  }

  return formatter;
}

export function formatCurrency(amount: number, currency: string): string {
  return getCurrencyFormatter(currency).format(amount);
}
