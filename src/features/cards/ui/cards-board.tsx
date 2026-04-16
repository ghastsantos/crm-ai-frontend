import { useState } from 'react';
import { CARD_STAGES, type Card, type CardStage } from '@/entities/card/types';
import { Button } from '@/shared/ui/button';
import { cardStageLabel } from '../lib/card-stage-label';
import { CardDetailsModal } from './card-details-modal';
import { CardItem } from './card-item';
import { CreateCardModal } from './create-card-modal';

type CardsBoardProps = {
  cards: Card[];
  organizationId: string;
};

export function CardsBoard({ cards, organizationId }: CardsBoardProps) {
  const byStage = groupByStage(cards);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="-mx-1 overflow-x-auto pb-2">
      <div
        className="grid gap-3 px-1"
        style={{
          gridTemplateColumns: `repeat(${CARD_STAGES.length}, minmax(0, 1fr))`,
          minWidth: `${CARD_STAGES.length * 180}px`,
        }}
      >
        {CARD_STAGES.map((stage, index) => {
          const items = byStage[stage];
          const isEntry = index === 0;
          return (
            <div
              key={stage}
              className="flex flex-col rounded-lg border border-zinc-200 bg-zinc-50/60"
            >
              <div className="flex items-center justify-between gap-2 border-b border-zinc-200 px-3 py-2">
                <div className="flex min-w-0 items-center gap-2">
                  <h3 className="truncate text-xs font-medium tracking-tight text-zinc-800">
                    {cardStageLabel(stage)}
                  </h3>
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-zinc-200 bg-white px-1.5 text-[10px] font-medium text-zinc-600">
                    {items.length}
                  </span>
                </div>
                <button
                  type="button"
                  aria-label={`Adicionar negócio em ${cardStageLabel(stage)}`}
                  className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300"
                >
                  <PlusIcon />
                </button>
              </div>

              <div className="flex min-h-32 flex-col gap-2 p-2">
                {items.length === 0 ? (
                  <p className="px-2 py-3 text-center text-[11px] leading-relaxed text-zinc-400">
                    {emptyStateMessage(stage)}
                  </p>
                ) : (
                  items.map((c) => <CardItem key={c.id} card={c} onClick={setSelectedCard} />)
                )}
              </div>

              {isEntry ? (
                <div className="border-t border-zinc-200 p-2">
                  <Button
                    variant="primary"
                    className="h-8 w-full rounded-full px-3 text-xs"
                    onClick={() => setCreateOpen(true)}
                  >
                    <PlusIcon className="mr-1" />
                    Criar negócio
                  </Button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      <CardDetailsModal card={selectedCard} onClose={() => setSelectedCard(null)} />
      <CreateCardModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        organizationId={organizationId}
      />
    </div>
  );
}

function groupByStage(cards: Card[]): Record<CardStage, Card[]> {
  const initial = Object.fromEntries(CARD_STAGES.map((s) => [s, [] as Card[]])) as Record<
    CardStage,
    Card[]
  >;
  for (const card of cards) {
    initial[card.stage].push(card);
  }
  return initial;
}

function emptyStateMessage(stage: CardStage): string {
  if (stage === 'LEAD_CAPTADO') return 'Aqui chegam os negócios captados.';
  if (stage === 'QUALIFICACAO_MQL_ICP') return 'Negócios em qualificação aparecem aqui.';
  if (stage === 'CONTATO_INICIAL') return 'Negócios em contato inicial aparecem aqui.';
  if (stage === 'PROPOSTA') return 'Propostas enviadas aparecem aqui.';
  if (stage === 'NEGOCIACAO') return 'Negociações em andamento aparecem aqui.';
  if (stage === 'FECHAMENTO') return 'Negócios em fechamento aparecem aqui.';
  return 'Sem negócios.';
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
