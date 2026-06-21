import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { Card } from '@/entities/card/types';
import { getPipelineColumnLabel } from '@/entities/pipeline-column/labels';
import type { PipelineColumn } from '@/entities/pipeline-column/types';
import { useLocale } from '@/features/locale/hooks/use-locale';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';
import { useMoveCard } from '../hooks/use-cards';
import { CardDetailsModal } from './card-details-modal';
import { CardItem } from './card-item';
import { CreateCardModal } from './create-card-modal';

type CardsBoardProps = {
  columns: PipelineColumn[];
  cards: Card[];
  organizationId: string;
};

type CreateModalState = {
  open: boolean;
  columnId: string | null;
  columnTitle: string | null;
};

export function CardsBoard({ columns, cards, organizationId }: CardsBoardProps) {
  const { t } = useLocale();
  const sortedColumns = [...columns].sort((a, b) => a.position - b.position);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [createModal, setCreateModal] = useState<CreateModalState>({
    open: false,
    columnId: null,
    columnTitle: null,
  });
  const [activeDragCard, setActiveDragCard] = useState<Card | null>(null);

  const moveCardMutation = useMoveCard();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function openCreate(columnId: string, columnTitle: string) {
    setCreateModal({ open: true, columnId, columnTitle });
  }

  function cardsInColumn(columnId: string): Card[] {
    return cards
      .filter((card) => card.pipelineColumnId === columnId)
      .sort((a, b) => a.position - b.position);
  }

  function handleDragStart(event: DragStartEvent) {
    const id = event.active.id as string;
    const card = cards.find((item) => item.id === id);
    setActiveDragCard(card ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDragCard(null);
    const { active, over } = event;
    if (!over) return;

    const cardId = active.id as string;
    const card = cards.find((item) => item.id === cardId);
    if (!card) return;

    const overId = over.id as string;
    const overData = over.data.current as
      | { type: 'card'; pipelineColumnId: string; position: number }
      | { type: 'column'; columnId: string }
      | undefined;

    let targetColumnId: string;
    let targetPosition: number | undefined;

    if (overData?.type === 'card') {
      targetColumnId = overData.pipelineColumnId;
      const targetCards = cardsInColumn(targetColumnId).filter((item) => item.id !== cardId);
      const overIndex = targetCards.findIndex((item) => item.id === overId);
      targetPosition = overIndex === -1 ? targetCards.length : overIndex;
    } else if (overData?.type === 'column') {
      targetColumnId = overData.columnId;
      targetPosition = cardsInColumn(targetColumnId).filter((item) => item.id !== cardId).length;
    } else {
      return;
    }

    if (card.pipelineColumnId === targetColumnId && card.position === targetPosition) return;

    moveCardMutation.mutate({
      cardId,
      organizationId,
      body: {
        pipelineColumnId: targetColumnId,
        position: targetPosition,
      },
    });
  }

  const columnCount = Math.max(sortedColumns.length, 1);
  const minColumnWidth = 280;
  const fitColumnsThreshold = 4;
  const fitColumns = sortedColumns.length > 0 && sortedColumns.length <= fitColumnsThreshold;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveDragCard(null)}
    >
      <div className="min-w-0 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 lg:hidden">
            {t('board.swipe_hint')}
          </p>
        </div>

        <div className={cn('-mx-1 pb-2', fitColumns ? 'overflow-x-visible' : 'overflow-x-auto')}>
          <div
            className="grid min-h-[32vh] gap-3 px-1 lg:min-h-[52vh]"
            style={{
              gridTemplateColumns: fitColumns
                ? `repeat(${columnCount}, minmax(0, 1fr))`
                : `repeat(${columnCount}, ${minColumnWidth}px)`,
              width: fitColumns
                ? '100%'
                : sortedColumns.length
                  ? `${sortedColumns.length * (minColumnWidth + 12)}px`
                  : undefined,
            }}
          >
            {sortedColumns.map((column) => {
              const items = cardsInColumn(column.id);
              const columnTitle = getPipelineColumnLabel(column, t);

              return (
                <BoardColumn
                  key={column.id}
                  column={column}
                  columnTitle={columnTitle}
                  items={items}
                  onCardClick={setSelectedCard}
                  onAddCard={() => openCreate(column.id, columnTitle)}
                />
              );
            })}
          </div>
        </div>

        {selectedCard ? (
          <CardDetailsModal
            key={selectedCard.id}
            card={selectedCard}
            columns={sortedColumns}
            organizationId={organizationId}
            onClose={() => setSelectedCard(null)}
          />
        ) : null}

        <CreateCardModal
          key={createModal.open && createModal.columnId ? createModal.columnId : 'create-idle'}
          open={createModal.open}
          onClose={() => setCreateModal({ open: false, columnId: null, columnTitle: null })}
          organizationId={organizationId}
          defaultPipelineColumnId={createModal.columnId}
          defaultColumnTitle={createModal.columnTitle}
        />
      </div>

      <DragOverlay>
        {activeDragCard ? <CardItem card={activeDragCard} sortable={false} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

type BoardColumnProps = {
  column: PipelineColumn;
  columnTitle: string;
  items: Card[];
  onCardClick: (card: Card) => void;
  onAddCard: () => void;
};

function BoardColumn({ column, columnTitle, items, onCardClick, onAddCard }: BoardColumnProps) {
  const { t } = useLocale();
  const { setNodeRef, isOver } = useDroppable({
    id: `column:${column.id}`,
    data: { type: 'column', columnId: column.id },
  });

  const iconClassName = cn(
    'inline-flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition-colors',
    'hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 dark:focus-visible:ring-zinc-700'
  );

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex min-h-[28vh] flex-col rounded-lg border border-zinc-200 bg-zinc-50/60 transition-colors lg:min-h-[48vh]',
        'dark:border-zinc-800 dark:bg-zinc-900/40',
        isOver && 'border-zinc-400 bg-zinc-100/80 dark:border-zinc-600 dark:bg-zinc-800/60'
      )}
    >
      <div className="relative flex items-center justify-between gap-2 border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <h3 className="truncate text-sm font-medium tracking-tight text-zinc-800 dark:text-zinc-100 lg:text-base">
            {columnTitle}
          </h3>
          <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white px-1.5 text-[10px] font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
            {items.length}
          </span>
        </div>

        <button
          type="button"
          aria-label={t('board.add_card_aria', { column: columnTitle })}
          className={cn(iconClassName, 'cursor-pointer')}
          onClick={onAddCard}
        >
          <PlusIcon />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-2">
        <SortableContext
          items={items.map((card) => card.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.length === 0 ? (
            <p className="px-2 py-4 text-center text-xs leading-relaxed text-zinc-400 dark:text-zinc-500">
              {t('board.empty_column')}
            </p>
          ) : (
            items.map((card) => <CardItem key={card.id} card={card} onClick={onCardClick} />)
          )}
        </SortableContext>
      </div>

      <div className="border-t border-zinc-200 p-2 dark:border-zinc-800">
        <Button
          variant="primary"
          className="h-9 w-full rounded-full px-3 text-xs lg:text-sm"
          onClick={onAddCard}
        >
          <PlusIcon className="mr-1" />
          {t('board.create_card')}
        </Button>
      </div>
    </div>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
