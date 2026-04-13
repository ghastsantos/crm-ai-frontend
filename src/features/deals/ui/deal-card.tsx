import type { Deal } from '@/entities/deal/types';
import { Card } from '@/shared/ui/card';
import { formatCurrency } from '../lib/format-currency';

type DealCardProps = {
  deal: Deal;
};

export function DealCard({ deal }: DealCardProps) {
  return (
    <Card className="p-4">
      <h3 className="truncate text-sm font-medium tracking-tight text-zinc-900">{deal.title}</h3>
      <p className="mt-1 truncate text-xs text-zinc-500">{deal.company}</p>
      <p className="mt-0.5 truncate text-xs text-zinc-400">{deal.contactName}</p>
      <div className="mt-4 border-t border-zinc-100 pt-3 text-xs font-medium text-zinc-900">
        {formatCurrency(deal.amount, deal.currency)}
      </div>
    </Card>
  );
}
