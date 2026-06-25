import { useState } from 'react';
import { ActivityChart } from '@/features/metrics/ui/activity-chart';
import { MetricsKpiGrid } from '@/features/metrics/ui/metrics-kpi-grid';
import { OperationalPanels } from '@/features/metrics/ui/operational-panels';
import { PipelineStageChart } from '@/features/metrics/ui/pipeline-stage-chart';
import { RecentActivityList } from '@/features/metrics/ui/recent-activity-list';
import { useMetricsOverview } from '@/features/metrics/hooks/use-metrics-overview';
import type { MetricsRangeDays } from '@/features/metrics/api/metrics-api';
import { useLocale } from '@/features/locale/hooks/use-locale';
import { useActiveOrganization } from '@/features/organizations/hooks/use-active-organization';
import { Button } from '@/shared/ui/button';
import { Card, CardDescription, CardTitle } from '@/shared/ui/card';

const rangeOptions: MetricsRangeDays[] = [7, 14, 30, 90];

export function MetricsPage() {
  const { t, locale } = useLocale();
  const { active } = useActiveOrganization();
  const organizationId = active?.organizationId;
  const [rangeDays, setRangeDays] = useState<MetricsRangeDays>(30);
  const metricsQuery = useMetricsOverview(organizationId, rangeDays);

  if (!organizationId || !active) {
    return (
      <div className="space-y-6">
        <PageTitle title={t('metrics.title')} description={t('metrics.empty_org')} />
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <PageTitle
          title={t('metrics.title')}
          description={t('metrics.description', { organization: active.organizationName })}
        />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <select
            value={rangeDays}
            onChange={(event) => setRangeDays(Number(event.target.value) as MetricsRangeDays)}
            className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-sm outline-none transition-colors focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus-visible:border-zinc-600 dark:focus-visible:ring-zinc-700"
            aria-label={t('metrics.range.label')}
          >
            {rangeOptions.map((option) => (
              <option key={option} value={option}>
                {t('metrics.range.option', { days: option })}
              </option>
            ))}
          </select>

          <Button
            variant="outline"
            onClick={() => void metricsQuery.refetch()}
            disabled={metricsQuery.isFetching}
          >
            {metricsQuery.isFetching ? t('metrics.refreshing') : t('metrics.refresh')}
          </Button>
        </div>
      </div>

      {metricsQuery.isError ? (
        <p className="text-sm text-red-500 dark:text-red-300">{t('metrics.fetch_error')}</p>
      ) : null}

      {metricsQuery.isLoading ? (
        <LoadingState />
      ) : metricsQuery.data ? (
        <>
          <div className="text-xs text-zinc-400 dark:text-zinc-500">
            {t('metrics.last_update')}{' '}
            {metricsQuery.dataUpdatedAt
              ? new Intl.DateTimeFormat(locale, {
                  dateStyle: 'short',
                  timeStyle: 'short',
                }).format(new Date(metricsQuery.dataUpdatedAt))
              : t('logs.not_updated')}
          </div>

          <MetricsKpiGrid overview={metricsQuery.data} />

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
            <PipelineStageChart stages={metricsQuery.data.pipeline.byStage} />
            <RecentActivityList recent={metricsQuery.data.activity.recent} />
          </div>

          <ActivityChart daily={metricsQuery.data.activity.daily} />
          <OperationalPanels overview={metricsQuery.data} />
        </>
      ) : null}
    </div>
  );
}

function PageTitle({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-widest text-emerald-500 dark:text-emerald-400">
        {title}
      </p>
      <h1 className="mt-2 text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
        {title}
      </h1>
      <p className="mt-1 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => (
        <Card key={index} className="min-h-[124px] animate-pulse">
          <CardDescription className="mt-0 h-3 w-24 rounded bg-zinc-100 text-transparent dark:bg-zinc-800">
            loading
          </CardDescription>
          <CardTitle className="mt-4 h-7 w-20 rounded bg-zinc-100 text-transparent dark:bg-zinc-800">
            loading
          </CardTitle>
        </Card>
      ))}
    </div>
  );
}
