import { getPipelineColumnNameLabel } from '@/entities/pipeline-column/labels';
import { formatCurrency } from '@/features/cards/lib/format-currency';
import { useLocale } from '@/features/locale/hooks/use-locale';
import { Card, CardDescription, CardTitle } from '@/shared/ui/card';
import type { MetricsOverview } from '../api/metrics-api';

type Props = {
  stages: MetricsOverview['pipeline']['byStage'];
};

const stageColors = ['#0f766e', '#2563eb', '#7c3aed', '#d97706', '#dc2626', '#52525b'];

export function PipelineStageChart({ stages }: Props) {
  const { t, locale } = useLocale();
  const totalDeals = stages.reduce((sum, stage) => sum + stage.dealCount, 0);
  const totalValue = stages.reduce((sum, stage) => sum + Number(stage.value), 0);
  const maxDeals = Math.max(...stages.map((stage) => stage.dealCount), 1);
  const maxValue = Math.max(...stages.map((stage) => Number(stage.value)), 1);
  const busiestStage = stages.reduce<Props['stages'][number] | null>(
    (best, stage) => (!best || stage.dealCount > best.dealCount ? stage : best),
    null
  );
  const richestStage = stages.reduce<Props['stages'][number] | null>(
    (best, stage) => (!best || Number(stage.value) > Number(best.value) ? stage : best),
    null
  );

  return (
    <Card className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <CardTitle>{t('metrics.pipeline.title')}</CardTitle>
          <CardDescription>{t('metrics.pipeline.description')}</CardDescription>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <SummaryPill
            label={t('metrics.pipeline.total_deals')}
            value={formatNumber(totalDeals, locale)}
          />
          <SummaryPill
            label={t('metrics.pipeline.total_value')}
            value={formatCurrency(totalValue)}
          />
        </div>
      </div>

      <div className="grid gap-3">
        {stages.map((stage, index) => {
          const label = getPipelineColumnNameLabel(stage.title, t);
          const color = stageColors[index % stageColors.length];
          const dealShare = totalDeals > 0 ? stage.dealCount / totalDeals : 0;
          const value = Number(stage.value);
          const valueShare = totalValue > 0 ? value / totalValue : 0;
          const dealWidth = barWidth(stage.dealCount, maxDeals);
          const valueWidth = barWidth(value, maxValue);

          return (
            <div
              key={stage.columnId}
              className="grid gap-2 rounded-md border border-zinc-200 p-3 dark:border-zinc-800"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: color }}
                      aria-hidden="true"
                    />
                    <p className="truncate text-sm font-medium text-zinc-950 dark:text-zinc-50">
                      {label}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {t('metrics.pipeline.stage_share', {
                      deals: stage.dealCount,
                      percent: formatPercent(dealShare),
                    })}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                    {formatCurrency(value)}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {formatPercent(valueShare)} {t('metrics.pipeline.of_value')}
                  </p>
                </div>
              </div>

              <div className="grid gap-1.5">
                <Bar label={t('metrics.pipeline.legend.deals')} width={dealWidth} color={color} />
                <Bar
                  label={t('metrics.pipeline.legend.value')}
                  width={valueWidth}
                  color="#64748b"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-3 border-t border-zinc-200 pt-4 text-xs dark:border-zinc-800 md:grid-cols-2">
        <Insight
          label={t('metrics.pipeline.busiest_stage')}
          value={busiestStage ? getPipelineColumnNameLabel(busiestStage.title, t) : '-'}
        />
        <Insight
          label={t('metrics.pipeline.richest_stage')}
          value={richestStage ? getPipelineColumnNameLabel(richestStage.title, t) : '-'}
        />
      </div>
    </Card>
  );
}

function SummaryPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-zinc-200 px-3 py-2 dark:border-zinc-800">
      <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
        {label}
      </p>
      <p className="mt-1 font-semibold text-zinc-950 dark:text-zinc-50">{value}</p>
    </div>
  );
}

function Bar({ label, width, color }: { label: string; width: string; color: string }) {
  return (
    <div className="grid grid-cols-[72px_minmax(0,1fr)] items-center gap-2">
      <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
        {label}
      </span>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div className="h-full rounded-full" style={{ width, backgroundColor: color }} />
      </div>
    </div>
  );
}

function Insight({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-zinc-950 dark:text-zinc-50">{value}</p>
    </div>
  );
}

function formatNumber(value: number, locale: string) {
  return new Intl.NumberFormat(locale).format(value);
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function barWidth(value: number, max: number) {
  if (value <= 0 || max <= 0) return '0%';
  return `${Math.max(6, (value / max) * 100)}%`;
}
