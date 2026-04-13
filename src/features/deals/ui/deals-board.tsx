import { DEAL_STAGES, type Deal, type DealStage } from '@/entities/deal/types';
import { Button } from '@/shared/ui/button';
import { dealStageLabel } from '../lib/deal-stage-label';
import { DealCard } from './deal-card';

type DealsBoardProps = {
  deals: Deal[];
};

export function DealsBoard({ deals }: DealsBoardProps) {
  const byStage = groupByStage(deals);

  return (
    <div className="-mx-1 overflow-x-auto pb-2">
      <div className="grid min-w-[1080px] grid-cols-6 gap-3 px-1">
        {DEAL_STAGES.map((stage, index) => {
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
                    {dealStageLabel(stage)}
                  </h3>
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-zinc-200 bg-white px-1.5 text-[10px] font-medium text-zinc-600">
                    {items.length}
                  </span>
                </div>
                <button
                  type="button"
                  aria-label={`Adicionar negócio em ${dealStageLabel(stage)}`}
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
                  items.map((d) => <DealCard key={d.id} deal={d} />)
                )}
              </div>

              {isEntry ? (
                <div className="border-t border-zinc-200 p-2">
                  <Button variant="primary" className="h-8 w-full rounded-full px-3 text-xs">
                    <PlusIcon className="mr-1" />
                    Criar novo card
                  </Button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function groupByStage(deals: Deal[]): Record<DealStage, Deal[]> {
  const initial = Object.fromEntries(DEAL_STAGES.map((s) => [s, [] as Deal[]])) as Record<
    DealStage,
    Deal[]
  >;
  for (const deal of deals) {
    initial[deal.stage].push(deal);
  }
  return initial;
}

function emptyStateMessage(stage: DealStage): string {
  if (stage === 'lead') return 'Aqui chegam os negócios captados.';
  if (stage === 'qualification') return 'Negócios em qualificação aparecem aqui.';
  if (stage === 'initial_contact') return 'Negócios em contato inicial aparecem aqui.';
  if (stage === 'proposal') return 'Propostas enviadas aparecem aqui.';
  if (stage === 'negotiation') return 'Negociações em andamento aparecem aqui.';
  if (stage === 'closing') return 'Negócios em fechamento aparecem aqui.';
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
