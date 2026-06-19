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
import type { PipelineColumn } from '@/entities/pipeline-column/types';
import { useLocale } from '@/features/locale/hooks/use-locale';
import { cn } from '@/shared/lib/cn';
import { formatApiError } from '@/shared/lib/format-api-error';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Modal } from '@/shared/ui/modal';
import { useMoveCard } from '../hooks/use-cards';
import { CardDetailsModal } from './card-details-modal';
import { CardItem } from './card-item';
import { CreateCardModal } from './create-card-modal';

export type CardsBoardColumnActions = {
  onRenameColumn: (columnId: string, title: string) => Promise<void>;
  onMoveColumn: (columnId: string, position: number) => Promise<void>;
  onDeleteColumn: (columnId: string, moveToColumnId?: string) => Promise<void>;
  onAddColumn: (title: string) => Promise<void>;
};

type CardsBoardProps = {
  columns: PipelineColumn[];
  cards: Card[];
  organizationId: string;
  columnActions: CardsBoardColumnActions;
};

type CreateModalState = {
  open: boolean;
  columnId: string | null;
  columnTitle: string | null;
};

const MIN_PIPELINE_COLUMNS = 5;
const MAX_PIPELINE_COLUMNS = 6;

export function CardsBoard({ columns, cards, organizationId, columnActions }: CardsBoardProps) {
  const { t } = useLocale();
  const sortedColumns = [...columns].sort((a, b) => a.position - b.position);
  const canAddColumn = sortedColumns.length < MAX_PIPELINE_COLUMNS;
  const canDeleteColumn = sortedColumns.length > MIN_PIPELINE_COLUMNS;
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [createModal, setCreateModal] = useState<CreateModalState>({
    open: false,
    columnId: null,
    columnTitle: null,
  });
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [renameState, setRenameState] = useState<{ id: string; title: string } | null>(null);
  const [addColumnOpen, setAddColumnOpen] = useState(false);
  const [addColumnTitle, setAddColumnTitle] = useState('');
  const [columnActionError, setColumnActionError] = useState<string | null>(null);
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
    setMenuOpenId(null);
    setCreateModal({ open: true, columnId, columnTitle });
  }

  function cardsInColumn(columnId: string): Card[] {
    return cards
      .filter((c) => c.pipelineColumnId === columnId)
      .sort((a, b) => a.position - b.position);
  }

  async function handleDeleteColumn(column: PipelineColumn) {
    setMenuOpenId(null);
    setColumnActionError(null);
    if (!canDeleteColumn) {
      setColumnActionError(t('board.column_minimum_hint'));
      return;
    }
    const inCol = cardsInColumn(column.id);
    try {
      if (inCol.length === 0) {
        await columnActions.onDeleteColumn(column.id);
        return;
      }
      const fallback = sortedColumns.find((c) => c.id !== column.id);
      if (!fallback) {
        setColumnActionError(t('board.cannot_delete_only'));
        return;
      }
      const ok = window.confirm(
        t('board.confirm_delete_with_cards', { count: inCol.length, target: fallback.title })
      );
      if (!ok) return;
      await columnActions.onDeleteColumn(column.id, fallback.id);
    } catch (e: unknown) {
      setColumnActionError(formatApiError(e));
    }
  }

  async function handleMoveColumn(column: PipelineColumn, direction: 'left' | 'right') {
    setColumnActionError(null);
    const idx = sortedColumns.findIndex((c) => c.id === column.id);
    if (idx === -1) return;
    const target = direction === 'left' ? idx - 1 : idx + 1;
    if (target < 0 || target >= sortedColumns.length) return;
    try {
      await columnActions.onMoveColumn(column.id, target);
    } catch (e: unknown) {
      setColumnActionError(formatApiError(e));
    }
  }

  async function submitRename() {
    if (!renameState?.title.trim()) return;
    setColumnActionError(null);
    try {
      await columnActions.onRenameColumn(renameState.id, renameState.title.trim());
      setRenameState(null);
    } catch (e: unknown) {
      setColumnActionError(formatApiError(e));
    }
  }

  async function submitAddColumn() {
    if (!addColumnTitle.trim()) return;
    setColumnActionError(null);
    if (!canAddColumn) {
      setColumnActionError(t('board.column_limit_hint'));
      return;
    }
    try {
      await columnActions.onAddColumn(addColumnTitle.trim());
      setAddColumnTitle('');
      setAddColumnOpen(false);
    } catch (e: unknown) {
      setColumnActionError(formatApiError(e));
    }
  }

  function handleDragStart(e: DragStartEvent) {
    const id = e.active.id as string;
    const card = cards.find((c) => c.id === id);
    setActiveDragCard(card ?? null);
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveDragCard(null);
    const { active, over } = e;
    if (!over) return;
    const cardId = active.id as string;
    const card = cards.find((c) => c.id === cardId);
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
      const targetCards = cardsInColumn(targetColumnId).filter((c) => c.id !== cardId);
      const overIdx = targetCards.findIndex((c) => c.id === overId);
      targetPosition = overIdx === -1 ? targetCards.length : overIdx;
    } else if (overData?.type === 'column') {
      targetColumnId = overData.columnId;
      targetPosition = cardsInColumn(targetColumnId).filter((c) => c.id !== cardId).length;
    } else {
      return;
    }

    if (card.pipelineColumnId === targetColumnId && card.position === targetPosition) return;

    moveCardMutation.mutate(
      {
        cardId,
        organizationId,
        body: {
          pipelineColumnId: targetColumnId,
          position: targetPosition,
        },
      },
      {
        onError: (err: unknown) => {
          setColumnActionError(formatApiError(err));
        },
      }
    );
  }

  const n = Math.max(sortedColumns.length, 1);
  const minColPx = 280;
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
        {columnActionError ? (
          <p className="text-xs text-red-700 dark:text-red-300">{columnActionError}</p>
        ) : null}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 lg:hidden">
            {t('board.swipe_hint')}
          </p>
          <Button
            type="button"
            variant="ghost"
            className="h-8 shrink-0 text-xs"
            disabled={!canAddColumn}
            onClick={() => {
              if (!canAddColumn) {
                setColumnActionError(t('board.column_limit_hint'));
                return;
              }
              setColumnActionError(null);
              setAddColumnOpen(true);
            }}
          >
            {t('board.add_column')}
          </Button>
        </div>
        {!canAddColumn ? (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {t('board.column_limit_hint')}
          </p>
        ) : null}

        <div className={cn('-mx-1 pb-2', fitColumns ? 'overflow-x-visible' : 'overflow-x-auto')}>
          <div
            className="grid min-h-[32vh] gap-3 px-1 lg:min-h-[52vh]"
            style={{
              gridTemplateColumns: fitColumns
                ? `repeat(${n}, minmax(0, 1fr))`
                : `repeat(${n}, ${minColPx}px)`,
              width: fitColumns
                ? '100%'
                : sortedColumns.length
                  ? `${sortedColumns.length * (minColPx + 12)}px`
                  : undefined,
            }}
          >
            {sortedColumns.map((col, idx) => {
              const items = cardsInColumn(col.id);
              return (
                <BoardColumn
                  key={col.id}
                  column={col}
                  items={items}
                  onCardClick={setSelectedCard}
                  onAddCard={() => openCreate(col.id, col.title)}
                  menuOpen={menuOpenId === col.id}
                  onToggleMenu={() => setMenuOpenId((id) => (id === col.id ? null : col.id))}
                  onRename={() => {
                    setMenuOpenId(null);
                    setRenameState({ id: col.id, title: col.title });
                  }}
                  onDelete={() => void handleDeleteColumn(col)}
                  onMoveLeft={() => void handleMoveColumn(col, 'left')}
                  onMoveRight={() => void handleMoveColumn(col, 'right')}
                  canMoveLeft={idx > 0}
                  canMoveRight={idx < sortedColumns.length - 1}
                  canDelete={canDeleteColumn}
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

        <Modal
          open={renameState !== null}
          onClose={() => setRenameState(null)}
          title={
            <h2 className="text-base font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
              {t('board.rename_column')}
            </h2>
          }
        >
          {renameState ? (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="rename-col">{t('board.column_name')}</Label>
                <Input
                  id="rename-col"
                  value={renameState.title}
                  onChange={(e) => setRenameState({ ...renameState, title: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setRenameState(null)}>
                  {t('common.cancel')}
                </Button>
                <Button type="button" onClick={() => void submitRename()}>
                  {t('common.save')}
                </Button>
              </div>
            </div>
          ) : null}
        </Modal>

        <Modal
          open={addColumnOpen}
          onClose={() => {
            setAddColumnOpen(false);
            setAddColumnTitle('');
          }}
          title={
            <h2 className="text-base font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
              {t('board.new_column')}
            </h2>
          }
        >
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="add-col">{t('board.column_name_field')}</Label>
              <Input
                id="add-col"
                value={addColumnTitle}
                onChange={(e) => setAddColumnTitle(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setAddColumnOpen(false);
                  setAddColumnTitle('');
                }}
              >
                {t('common.cancel')}
              </Button>
              <Button type="button" onClick={() => void submitAddColumn()}>
                {t('common.create')}
              </Button>
            </div>
          </div>
        </Modal>
      </div>

      <DragOverlay>
        {activeDragCard ? <CardItem card={activeDragCard} sortable={false} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

type BoardColumnProps = {
  column: PipelineColumn;
  items: Card[];
  onCardClick: (card: Card) => void;
  onAddCard: () => void;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onRename: () => void;
  onDelete: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  canDelete: boolean;
};

function BoardColumn({
  column,
  items,
  onCardClick,
  onAddCard,
  menuOpen,
  onToggleMenu,
  onRename,
  onDelete,
  onMoveLeft,
  onMoveRight,
  canMoveLeft,
  canMoveRight,
  canDelete,
}: BoardColumnProps) {
  const { t } = useLocale();
  const { setNodeRef, isOver } = useDroppable({
    id: `column:${column.id}`,
    data: { type: 'column', columnId: column.id },
  });

  const baseIconClass = cn(
    'inline-flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition-colors',
    'hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 dark:focus-visible:ring-zinc-700',
    'disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-500'
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
          <button
            type="button"
            aria-label={t('board.move_left')}
            title={t('board.move_left')}
            disabled={!canMoveLeft}
            onClick={onMoveLeft}
            className={cn(baseIconClass, 'h-6 w-6 cursor-pointer')}
          >
            <ArrowLeftIcon />
          </button>
          <h3 className="truncate text-sm font-medium tracking-tight text-zinc-800 dark:text-zinc-100 lg:text-base">
            {column.title}
          </h3>
          <button
            type="button"
            aria-label={t('board.move_right')}
            title={t('board.move_right')}
            disabled={!canMoveRight}
            onClick={onMoveRight}
            className={cn(baseIconClass, 'h-6 w-6 cursor-pointer')}
          >
            <ArrowRightIcon />
          </button>
          <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white px-1.5 text-[10px] font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
            {items.length}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            aria-label={t('board.add_card_aria', { column: column.title })}
            className={cn(baseIconClass, 'cursor-pointer')}
            onClick={onAddCard}
          >
            <PlusIcon />
          </button>
          <button
            type="button"
            aria-label={t('board.column_options', { column: column.title })}
            className={cn(baseIconClass, 'cursor-pointer')}
            onClick={onToggleMenu}
          >
            <DotsIcon />
          </button>
        </div>
        {menuOpen ? (
          <div className="absolute right-1 top-full z-10 mt-1 w-44 rounded-md border border-zinc-200 bg-white py-1 shadow-md dark:border-zinc-800 dark:bg-zinc-900">
            <button
              type="button"
              className="block w-full px-3 py-2 text-left text-xs text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800"
              onClick={onRename}
            >
              {t('board.rename_column')}
            </button>
            <button
              type="button"
              disabled={!canDelete}
              className={cn(
                'block w-full px-3 py-2 text-left text-xs text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/40',
                !canDelete &&
                  'cursor-not-allowed text-zinc-400 hover:bg-transparent dark:text-zinc-600 dark:hover:bg-transparent'
              )}
              onClick={onDelete}
            >
              {t('board.delete_column')}
            </button>
          </div>
        ) : null}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-2">
        <SortableContext items={items.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {items.length === 0 ? (
            <p className="px-2 py-4 text-center text-xs leading-relaxed text-zinc-400 dark:text-zinc-500">
              {t('board.empty_column')}
            </p>
          ) : (
            items.map((c) => <CardItem key={c.id} card={c} onClick={onCardClick} />)
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

function DotsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="5" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="19" r="2" />
    </svg>
  );
}

function ArrowLeftIcon() {
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
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ArrowRightIcon() {
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
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
