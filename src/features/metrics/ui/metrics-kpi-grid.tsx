import { getPipelineColumnNameLabel } from '@/entities/pipeline-column/labels';
import { formatCurrency } from '@/features/cards/lib/format-currency';
import { useLocale } from '@/features/locale/hooks/use-locale';
import { Card } from '@/shared/ui/card';
import type { MetricsOverview } from '../api/metrics-api';

type Props = {
  overview: MetricsOverview;
};

type KpiCard = {
  label: string;
  value: string;
  detail: string;
  footnote: string;
  accent: string;
  progress: number;
};

export function MetricsKpiGrid({ overview }: Props) {
  const { t, locale } = useLocale();
  const totalDeals = overview.pipeline.totalDeals;
  const totalValue = Number(overview.pipeline.totalValue);
  const valueCoverage = ratio(overview.pipeline.dealsWithValue, totalDeals);
  const whatsappMessages =
    overview.whatsapp.inboundMessagesInRange + overview.whatsapp.outboundMessagesInRange;
  const activityTotal = overview.activity.totalLogsInRange;
  const topValueStage = overview.pipeline.byStage.reduce<
    MetricsOverview['pipeline']['byStage'][number] | null
  >((best, stage) => (!best || Number(stage.value) > Number(best.value) ? stage : best), null);

  const cards: KpiCard[] = [
    {
      label: t('metrics.kpi.pipeline_value'),
      value: formatCurrency(totalValue),
      detail: topValueStage
        ? t('metrics.kpi.top_value_stage', {
            stage: getPipelineColumnNameLabel(topValueStage.title, t),
          })
        : t('metrics.kpi.no_stage'),
      footnote: t('metrics.kpi.average_ticket_value', {
        value: overview.pipeline.averageTicket
          ? formatCurrency(Number(overview.pipeline.averageTicket))
          : '-',
      }),
      accent: '#0f766e',
      progress: totalDeals > 0 ? valueCoverage : 0,
    },
    {
      label: t('metrics.kpi.deals'),
      value: new Intl.NumberFormat(locale).format(totalDeals),
      detail: t('metrics.kpi.created_in_range', { count: overview.pipeline.createdInRange }),
      footnote: t('metrics.kpi.value_coverage', {
        percent: formatPercent(valueCoverage),
      }),
      accent: '#2563eb',
      progress: valueCoverage,
    },
    {
      label: t('metrics.kpi.activity'),
      value: new Intl.NumberFormat(locale).format(activityTotal),
      detail: t('metrics.kpi.movements', { count: overview.activity.moved }),
      footnote: t('metrics.kpi.updated_in_range', { count: overview.pipeline.updatedInRange }),
      accent: '#7c3aed',
      progress: ratio(
        overview.activity.moved + overview.activity.created,
        Math.max(activityTotal, 1)
      ),
    },
    {
      label: t('metrics.kpi.whatsapp'),
      value: new Intl.NumberFormat(locale).format(whatsappMessages),
      detail: t('metrics.kpi.whatsapp_detail', {
        inbound: overview.whatsapp.inboundMessagesInRange,
        outbound: overview.whatsapp.outboundMessagesInRange,
      }),
      footnote:
        overview.whatsapp.failedMessagesInRange > 0
          ? t('metrics.kpi.whatsapp_failures', { count: overview.whatsapp.failedMessagesInRange })
          : t('metrics.kpi.whatsapp_ok'),
      accent: '#d97706',
      progress: ratio(overview.whatsapp.outboundMessagesInRange, Math.max(whatsappMessages, 1)),
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <MetricCard key={card.label} card={card} />
      ))}
    </div>
  );
}

function MetricCard({ card }: { card: KpiCard }) {
  return (
    <Card className="relative min-h-[154px] overflow-hidden p-0">
      <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: card.accent }} />
      <div className="p-5">
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          {card.label}
        </p>
        <div className="mt-4 flex items-end justify-between gap-3">
          <p className="min-w-0 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            {card.value}
          </p>
          <span
            className="mb-1 h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: card.accent }}
            aria-hidden="true"
          />
        </div>
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
          {card.detail}
        </p>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div
            className="h-full rounded-full"
            style={{ width: progressWidth(card.progress), backgroundColor: card.accent }}
          />
        </div>
        <p className="mt-2 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
          {card.footnote}
        </p>
      </div>
    </Card>
  );
}

function ratio(part: number, total: number) {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(1, part / total));
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function progressWidth(value: number) {
  if (value <= 0) return '0%';
  return `${Math.max(4, value * 100)}%`;
}
