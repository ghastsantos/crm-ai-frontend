import { formatCurrency } from '@/features/cards/lib/format-currency';
import { useLocale } from '@/features/locale/hooks/use-locale';
import { Card, CardDescription, CardTitle } from '@/shared/ui/card';
import type { MetricsOverview } from '../api/metrics-api';

type Props = {
  overview: MetricsOverview;
};

export function MetricsKpiGrid({ overview }: Props) {
  const { t } = useLocale();

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        label={t('metrics.kpi.deals')}
        value={String(overview.pipeline.totalDeals)}
        detail={t('metrics.kpi.created_in_range', { count: overview.pipeline.createdInRange })}
      />
      <MetricCard
        label={t('metrics.kpi.pipeline_value')}
        value={formatCurrency(Number(overview.pipeline.totalValue))}
        detail={t('metrics.kpi.with_value', { count: overview.pipeline.dealsWithValue })}
      />
      <MetricCard
        label={t('metrics.kpi.average_ticket')}
        value={
          overview.pipeline.averageTicket
            ? formatCurrency(Number(overview.pipeline.averageTicket))
            : '-'
        }
        detail={t('metrics.kpi.without_value', { count: overview.pipeline.dealsWithoutValue })}
      />
      <MetricCard
        label={t('metrics.kpi.activity')}
        value={String(overview.activity.totalLogsInRange)}
        detail={t('metrics.kpi.movements', { count: overview.activity.moved })}
      />
    </div>
  );
}

function MetricCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <Card className="min-h-[124px]">
      <CardDescription className="mt-0 uppercase tracking-widest">{label}</CardDescription>
      <CardTitle className="mt-3 text-2xl">{value}</CardTitle>
      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{detail}</p>
    </Card>
  );
}
