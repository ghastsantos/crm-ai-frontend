import { getPipelineColumnNameLabel } from '@/entities/pipeline-column/labels';
import { formatCurrency } from '@/features/cards/lib/format-currency';
import { useLocale } from '@/features/locale/hooks/use-locale';
import { Card, CardDescription, CardTitle } from '@/shared/ui/card';
import type { MetricsOverview } from '../api/metrics-api';

type Props = {
  stages: MetricsOverview['pipeline']['byStage'];
};

export function PipelineStageChart({ stages }: Props) {
  const { t } = useLocale();
  const maxDeals = Math.max(...stages.map((stage) => stage.dealCount), 1);
  const maxValue = Math.max(...stages.map((stage) => Number(stage.value)), 1);

  return (
    <Card className="space-y-5">
      <div>
        <CardTitle>{t('metrics.pipeline.title')}</CardTitle>
        <CardDescription>{t('metrics.pipeline.description')}</CardDescription>
      </div>

      <div className="space-y-4">
        {stages.map((stage) => {
          const label = getPipelineColumnNameLabel(stage.title, t);
          const dealWidth = `${Math.max(4, (stage.dealCount / maxDeals) * 100)}%`;
          const value = Number(stage.value);
          const valueWidth = `${Math.max(4, (value / maxValue) * 100)}%`;

          return (
            <div key={stage.columnId} className="space-y-2">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate font-medium text-zinc-900 dark:text-zinc-100">
                  {label}
                </span>
                <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
                  {stage.dealCount} / {formatCurrency(value)}
                </span>
              </div>

              <div className="grid gap-1.5">
                <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-zinc-900 dark:bg-zinc-100"
                    style={{ width: dealWidth }}
                  />
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-emerald-500 dark:bg-emerald-400"
                    style={{ width: valueWidth }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
