import { useLocale } from '@/features/locale/hooks/use-locale';
import { formatCurrency } from '../lib/format-currency';
import type { PipelineKPIs } from '../hooks/use-pipeline-kpis';

type PipelineKPIsProps = {
  kpis: PipelineKPIs;
};

export function PipelineKPIsBoard({ kpis }: PipelineKPIsProps) {
  const { t } = useLocale();

  const cardsWithValueLabel =
    kpis.cardsWithValue === 0
      ? t('kpis.no_value')
      : kpis.cardsWithValue === 1
        ? t('kpis.cards_with_value_one', { count: kpis.cardsWithValue })
        : t('kpis.cards_with_value_other', { count: kpis.cardsWithValue });

  const ticketSublabel =
    kpis.cardsWithoutValue > 0
      ? t('kpis.without_value', { count: kpis.cardsWithoutValue })
      : t('kpis.all_with_value');

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <KpiCard
        label={t('kpis.cards')}
        value={String(kpis.totalCards)}
        sublabel={
          kpis.topStages.length === 0
            ? t('kpis.no_cards')
            : kpis.topStages.map((s) => `${s.count} ${s.title}`).join(' · ')
        }
      />
      <KpiCard
        label={t('kpis.value')}
        value={formatCurrency(kpis.totalValue || null)}
        sublabel={cardsWithValueLabel}
      />
      <KpiCard
        label={t('kpis.average')}
        value={kpis.averageTicket != null ? formatCurrency(kpis.averageTicket) : '—'}
        sublabel={ticketSublabel}
      />
    </div>
  );
}

function KpiCard({ label, value, sublabel }: { label: string; value: string; sublabel?: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
        {value}
      </p>
      {sublabel ? (
        <p className="mt-1 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">{sublabel}</p>
      ) : null}
    </div>
  );
}
