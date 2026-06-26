import { useState } from 'react';
import type { MetricsRangeDays } from '@/features/metrics/api/metrics-api';
import { useLocale } from '@/features/locale/hooks/use-locale';
import { useActiveOrganization } from '@/features/organizations/hooks/use-active-organization';
import { useMetricsOverview } from '@/features/metrics/hooks/use-metrics-overview';
import { ActivityChart } from '@/features/metrics/ui/activity-chart';
import { MetricsKpiGrid } from '@/features/metrics/ui/metrics-kpi-grid';
import { OperationalPanels } from '@/features/metrics/ui/operational-panels';
import { PipelineStageChart } from '@/features/metrics/ui/pipeline-stage-chart';
import { RecentActivityList } from '@/features/metrics/ui/recent-activity-list';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';

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
    <div className="min-w-0 space-y-6">
      <div className="border-b border-zinc-200 pb-6 dark:border-zinc-800">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <PageTitle
            title={t('metrics.title')}
            eyebrow={t('metrics.eyebrow')}
            description={t('metrics.description', { organization: active.organizationName })}
          />

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div
              className="inline-flex h-9 rounded-md border border-zinc-200 bg-white p-0.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              role="group"
              aria-label={t('metrics.range.label')}
            >
              {rangeOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setRangeDays(option)}
                  className={cn(
                    'h-8 rounded px-3 text-xs font-medium transition-colors',
                    option === rangeDays
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                      : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
                  )}
                  aria-pressed={option === rangeDays}
                >
                  {t('metrics.range.option', { days: option })}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              onClick={() => void metricsQuery.refetch()}
              disabled={metricsQuery.isFetching}
            >
              {metricsQuery.isFetching ? t('metrics.refreshing') : t('metrics.refresh')}
            </Button>
          </div>
        </div>

        {metricsQuery.data ? (
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 dark:border-zinc-800 dark:bg-zinc-900">
              {t('metrics.period.window', {
                days: metricsQuery.data.range.days,
              })}
            </span>
            <span>
              {t('metrics.last_update')}{' '}
              {metricsQuery.dataUpdatedAt
                ? new Intl.DateTimeFormat(locale, {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  }).format(new Date(metricsQuery.dataUpdatedAt))
                : t('logs.not_updated')}
            </span>
          </div>
        ) : null}
      </div>

      {metricsQuery.isError ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
          {t('metrics.fetch_error')}
        </p>
      ) : null}

      {metricsQuery.isLoading ? (
        <LoadingState label={t('metrics.loading')} />
      ) : metricsQuery.data ? (
        <>
          <MetricsKpiGrid overview={metricsQuery.data} />

          <div className="grid items-start gap-4 2xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
            <PipelineStageChart stages={metricsQuery.data.pipeline.byStage} />
            <OperationalPanels overview={metricsQuery.data} />
          </div>

          <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
            <ActivityChart daily={metricsQuery.data.activity.daily} />
            <RecentActivityList recent={metricsQuery.data.activity.recent} />
          </div>
        </>
      ) : null}
    </div>
  );
}

function PageTitle({
  title,
  eyebrow,
  description,
}: {
  title: string;
  eyebrow?: string;
  description: string;
}) {
  return (
    <div>
      {eyebrow ? (
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        {title}
      </h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">
        {description}
      </p>
    </div>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <div className="space-y-4" aria-label={label}>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Card key={index} className="min-h-[148px] animate-pulse">
            <div aria-hidden="true" className="h-3 w-28 rounded bg-zinc-100 dark:bg-zinc-800" />
            <div
              aria-hidden="true"
              className="mt-5 h-8 w-24 rounded bg-zinc-100 dark:bg-zinc-800"
            />
            <div
              aria-hidden="true"
              className="mt-4 h-2 w-full rounded bg-zinc-100 dark:bg-zinc-800"
            />
          </Card>
        ))}
      </div>
      <Card className="h-72 animate-pulse">
        <div aria-hidden="true" className="h-full rounded bg-zinc-100 dark:bg-zinc-800" />
      </Card>
    </div>
  );
}
