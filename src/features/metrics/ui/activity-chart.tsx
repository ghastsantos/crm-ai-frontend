import { useLocale } from '@/features/locale/hooks/use-locale';
import { Card, CardDescription, CardTitle } from '@/shared/ui/card';
import type { MetricsOverview } from '../api/metrics-api';

type Props = {
  daily: MetricsOverview['activity']['daily'];
};

type SegmentKey = 'dealsCreated' | 'movements' | 'updates' | 'deletions' | 'whatsappMessages';

const segments: Array<{
  key: SegmentKey;
  color: string;
  labelKey: string;
}> = [
  { key: 'dealsCreated', color: '#2563eb', labelKey: 'metrics.activity.legend.created' },
  { key: 'movements', color: '#0f766e', labelKey: 'metrics.activity.legend.moved' },
  { key: 'updates', color: '#7c3aed', labelKey: 'metrics.activity.legend.updated' },
  { key: 'deletions', color: '#dc2626', labelKey: 'metrics.activity.legend.deleted' },
  { key: 'whatsappMessages', color: '#d97706', labelKey: 'metrics.activity.legend.whatsapp' },
];

export function ActivityChart({ daily }: Props) {
  const { t, locale } = useLocale();
  const totals = daily.map((day) => ({
    ...day,
    total: day.dealsCreated + day.movements + day.updates + day.deletions + day.whatsappMessages,
  }));
  const maxTotal = Math.max(...totals.map((day) => day.total), 1);
  const activeDays = totals.filter((day) => day.total > 0).length;
  const busiest = totals.reduce<(typeof totals)[number] | null>(
    (best, day) => (!best || day.total > best.total ? day : best),
    null
  );
  const whatsappTotal = totals.reduce((sum, day) => sum + day.whatsappMessages, 0);
  const movementTotal = totals.reduce((sum, day) => sum + day.movements, 0);

  return (
    <Card className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <CardTitle>{t('metrics.activity.title')}</CardTitle>
          <CardDescription>{t('metrics.activity.description')}</CardDescription>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <MiniStat
            label={t('metrics.activity.active_days')}
            value={formatNumber(activeDays, locale)}
          />
          <MiniStat
            label={t('metrics.activity.movements')}
            value={formatNumber(movementTotal, locale)}
          />
          <MiniStat
            label={t('metrics.activity.whatsapp')}
            value={formatNumber(whatsappTotal, locale)}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {segments.map((segment) => (
          <div
            key={segment.key}
            className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400"
          >
            <span
              className="h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: segment.color }}
              aria-hidden="true"
            />
            {t(segment.labelKey)}
          </div>
        ))}
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="flex h-56 min-w-[620px] items-end gap-1.5 border-b border-zinc-200 px-1 dark:border-zinc-800">
          {totals.map((day) => {
            const label = formatDay(day.date, locale);
            const height = day.total > 0 ? `${Math.max(8, (day.total / maxTotal) * 100)}%` : '2%';

            return (
              <div key={day.date} className="flex h-full flex-1 flex-col justify-end gap-2">
                <div className="flex h-44 items-end">
                  <div
                    className="flex w-full flex-col-reverse overflow-hidden rounded-t-md bg-zinc-100 dark:bg-zinc-800"
                    style={{ height }}
                    title={`${label}: ${day.total}`}
                    aria-label={`${label}: ${day.total}`}
                  >
                    {segments.map((segment) => {
                      const value = day[segment.key];
                      if (value <= 0 || day.total <= 0) return null;
                      return (
                        <span
                          key={segment.key}
                          style={{
                            height: `${Math.max(8, (value / day.total) * 100)}%`,
                            backgroundColor: segment.color,
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
                <span className="text-center text-[10px] text-zinc-400 dark:text-zinc-500">
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-zinc-200 pt-4 text-xs dark:border-zinc-800">
        <p className="font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          {t('metrics.activity.peak_day')}
        </p>
        <p className="mt-1 text-sm font-semibold text-zinc-950 dark:text-zinc-50">
          {busiest && busiest.total > 0
            ? t('metrics.activity.peak_day_value', {
                date: formatFullDay(busiest.date, locale),
                count: busiest.total,
              })
            : t('metrics.activity.no_peak')}
        </p>
      </div>
    </Card>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-zinc-200 px-2.5 py-2 dark:border-zinc-800">
      <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
        {label}
      </p>
      <p className="mt-1 font-semibold text-zinc-950 dark:text-zinc-50">{value}</p>
    </div>
  );
}

function formatNumber(value: number, locale: string) {
  return new Intl.NumberFormat(locale).format(value);
}

function formatDay(date: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
  }).format(new Date(`${date}T00:00:00`));
}

function formatFullDay(date: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
  }).format(new Date(`${date}T00:00:00`));
}
