import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Card } from '@/entities/card/types';
import { useLocale } from '@/features/locale/hooks/use-locale';
import { cn } from '@/shared/lib/cn';
import { formatCurrency } from '../lib/format-currency';

type CardItemProps = {
  card: Card;
  onClick?: (card: Card) => void;
  sortable?: boolean;
};

export function CardItem({ card, onClick, sortable = true }: CardItemProps) {
  const { t, locale } = useLocale();
  const sortableState = useSortable({
    id: card.id,
    data: {
      type: 'card',
      cardId: card.id,
      pipelineColumnId: card.pipelineColumnId,
      position: card.position,
    },
    disabled: !sortable,
  });

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = sortableState;

  const style = sortable
    ? {
        transform: CSS.Transform.toString(transform),
        transition,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => {
        if (!isDragging) onClick?.(card);
      }}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !isDragging) {
          e.preventDefault();
          onClick?.(card);
        }
      }}
      className={cn(
        'block w-full rounded-lg border border-zinc-200 bg-white p-4 text-left transition-colors',
        'dark:border-zinc-800 dark:bg-zinc-900',
        'hover:border-zinc-300 dark:hover:border-zinc-700',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 dark:focus-visible:ring-zinc-700',
        sortable && 'cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-40 ring-2 ring-zinc-300 dark:ring-zinc-700'
      )}
      {...attributes}
      {...listeners}
      role="button"
      tabIndex={0}
    >
      <h3 className="truncate text-sm font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
        {card.title}
      </h3>
      {card.companyName ? (
        <p className="mt-1 truncate text-xs text-zinc-500 dark:text-zinc-400">{card.companyName}</p>
      ) : null}
      {card.contactName ? (
        <p className="mt-0.5 truncate text-xs text-zinc-400 dark:text-zinc-500">
          {card.contactName}
        </p>
      ) : null}
      <div className="mt-4 border-t border-zinc-100 pt-3 dark:border-zinc-800">
        <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
          {formatCurrency(card.value)}
        </p>
        <div className="mt-2 grid gap-0.5 text-[10px] text-zinc-400 dark:text-zinc-500">
          <p>
            {t('card.created_at')}: {formatCardDate(card.createdAt, locale)}
          </p>
          <p>
            {t('card.updated_at')}: {formatCardDate(card.updatedAt, locale)}
          </p>
        </div>
      </div>
    </div>
  );
}

function formatCardDate(value: string, locale: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(locale, {
    day: '2-digit',
    month: 'short',
  });
}
