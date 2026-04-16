import { useState } from 'react';
import type { Card } from '@/entities/card/types';
import type { PipelineColumn } from '@/entities/pipeline-column/types';
import { formatApiError } from '@/shared/lib/format-api-error';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Modal } from '@/shared/ui/modal';
import { CardDetailsModal } from './card-details-modal';
import { CardItem } from './card-item';
import { CreateCardModal } from './create-card-modal';

export type CardsBoardColumnActions = {
  onRenameColumn: (columnId: string, title: string) => Promise<void>;
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

export function CardsBoard({ columns, cards, organizationId, columnActions }: CardsBoardProps) {
  const sortedColumns = [...columns].sort((a, b) => a.position - b.position);
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

  function openCreate(columnId: string, columnTitle: string) {
    setMenuOpenId(null);
    setCreateModal({ open: true, columnId, columnTitle });
  }

  function cardsInColumn(columnId: string): Card[] {
    return cards.filter((c) => c.pipelineColumnId === columnId);
  }

  async function handleDeleteColumn(column: PipelineColumn) {
    setMenuOpenId(null);
    setColumnActionError(null);
    const inCol = cardsInColumn(column.id);
    try {
      if (inCol.length === 0) {
        await columnActions.onDeleteColumn(column.id);
        return;
      }
      const fallback = sortedColumns.find((c) => c.id !== column.id);
      if (!fallback) {
        setColumnActionError('Não é possível excluir a única coluna.');
        return;
      }
      const ok = window.confirm(
        `Esta coluna tem ${inCol.length} negócio(s). Mover para "${fallback.title}" e excluir?`
      );
      if (!ok) return;
      await columnActions.onDeleteColumn(column.id, fallback.id);
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
    try {
      await columnActions.onAddColumn(addColumnTitle.trim());
      setAddColumnTitle('');
      setAddColumnOpen(false);
    } catch (e: unknown) {
      setColumnActionError(formatApiError(e));
    }
  }

  const n = Math.max(sortedColumns.length, 1);
  const minColPx = 280;

  return (
    <div className="space-y-3">
      {columnActionError ? <p className="text-xs text-red-700">{columnActionError}</p> : null}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-zinc-500 lg:hidden">
          Deslize horizontalmente para ver todas as colunas.
        </p>
        <Button
          type="button"
          variant="ghost"
          className="h-8 shrink-0 text-xs"
          onClick={() => {
            setColumnActionError(null);
            setAddColumnOpen(true);
          }}
        >
          + Adicionar coluna
        </Button>
      </div>

      <div className="-mx-1 overflow-x-auto pb-2 lg:overflow-x-visible">
        <div
          className="grid min-h-[32vh] gap-3 px-1 lg:min-h-[52vh]"
          style={{
            gridTemplateColumns: `repeat(${n}, minmax(min(100%, ${minColPx}px), 1fr))`,
            minWidth: sortedColumns.length ? `${sortedColumns.length * minColPx}px` : undefined,
          }}
        >
          {sortedColumns.map((col) => {
            const items = cardsInColumn(col.id);
            return (
              <div
                key={col.id}
                className="flex min-h-[28vh] flex-col rounded-lg border border-zinc-200 bg-zinc-50/60 lg:min-h-[48vh]"
              >
                <div className="relative flex items-center justify-between gap-2 border-b border-zinc-200 px-3 py-2">
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <h3 className="truncate text-sm font-medium tracking-tight text-zinc-800 lg:text-base">
                      {col.title}
                    </h3>
                    <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white px-1.5 text-[10px] font-medium text-zinc-600">
                      {items.length}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <button
                      type="button"
                      aria-label={`Adicionar negócio em ${col.title}`}
                      className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300"
                      onClick={() => openCreate(col.id, col.title)}
                    >
                      <PlusIcon />
                    </button>
                    <button
                      type="button"
                      aria-label={`Opções da coluna ${col.title}`}
                      className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300"
                      onClick={() => setMenuOpenId((id) => (id === col.id ? null : col.id))}
                    >
                      <DotsIcon />
                    </button>
                  </div>
                  {menuOpenId === col.id ? (
                    <div className="absolute right-1 top-full z-10 mt-1 w-44 rounded-md border border-zinc-200 bg-white py-1 shadow-md">
                      <button
                        type="button"
                        className="block w-full px-3 py-2 text-left text-xs text-zinc-700 hover:bg-zinc-50"
                        onClick={() => {
                          setMenuOpenId(null);
                          setRenameState({ id: col.id, title: col.title });
                        }}
                      >
                        Renomear coluna
                      </button>
                      <button
                        type="button"
                        className="block w-full px-3 py-2 text-left text-xs text-red-700 hover:bg-red-50"
                        onClick={() => void handleDeleteColumn(col)}
                      >
                        Excluir coluna
                      </button>
                    </div>
                  ) : null}
                </div>

                <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-2">
                  {items.length === 0 ? (
                    <p className="px-2 py-4 text-center text-xs leading-relaxed text-zinc-400">
                      Nenhum negócio nesta coluna.
                    </p>
                  ) : (
                    items.map((c) => <CardItem key={c.id} card={c} onClick={setSelectedCard} />)
                  )}
                </div>

                <div className="border-t border-zinc-200 p-2">
                  <Button
                    variant="primary"
                    className="h-9 w-full rounded-full px-3 text-xs lg:text-sm"
                    onClick={() => openCreate(col.id, col.title)}
                  >
                    <PlusIcon className="mr-1" />
                    Criar negócio
                  </Button>
                </div>
              </div>
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
          <h2 className="text-base font-medium tracking-tight text-zinc-900">Renomear coluna</h2>
        }
      >
        {renameState ? (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="rename-col">Nome</Label>
              <Input
                id="rename-col"
                value={renameState.title}
                onChange={(e) => setRenameState({ ...renameState, title: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setRenameState(null)}>
                Cancelar
              </Button>
              <Button type="button" onClick={() => void submitRename()}>
                Salvar
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
        title={<h2 className="text-base font-medium tracking-tight text-zinc-900">Nova coluna</h2>}
      >
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="add-col">Nome da coluna</Label>
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
              Cancelar
            </Button>
            <Button type="button" onClick={() => void submitAddColumn()}>
              Criar
            </Button>
          </div>
        </div>
      </Modal>
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
