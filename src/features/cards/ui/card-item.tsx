import type { Card } from '@/entities/card/types';
import { formatCurrency } from '../lib/format-currency';

type CardItemProps = {
  card: Card;
  onClick?: (card: Card) => void;
};

export function CardItem({ card, onClick }: CardItemProps) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(card)}
      className="w-full cursor-pointer rounded-lg border border-zinc-200 bg-white p-4 text-left transition-colors hover:border-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300"
    >
      <h3 className="truncate text-sm font-medium tracking-tight text-zinc-900">{card.title}</h3>
      {card.companyName ? (
        <p className="mt-1 truncate text-xs text-zinc-500">{card.companyName}</p>
      ) : null}
      {card.contactName ? (
        <p className="mt-0.5 truncate text-xs text-zinc-400">{card.contactName}</p>
      ) : null}
      <div className="mt-4 border-t border-zinc-100 pt-3 text-xs font-medium text-zinc-900">
        {formatCurrency(card.value)}
      </div>
    </button>
  );
}
