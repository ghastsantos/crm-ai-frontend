import { useLocale } from '@/features/locale/hooks/use-locale';
import { Card, CardDescription, CardTitle } from '@/shared/ui/card';
import type { MetricsOverview } from '../api/metrics-api';

type Props = {
  daily: MetricsOverview['activity']['daily'];
};

export function ActivityChart({ daily }: Props) {
  const { t, locale } = useLocale();
  const maxTotal = Math.max(
    ...daily.map(
      (day) => day.dealsCreated + day.movements + day.updates + day.deletions + day.whatsappMessages
    ),
    1
  );

  return (
    <Card className="space-y-5">
      <div>
        <CardTitle>{t('metrics.activity.title')}</CardTitle>
        <CardDescription>{t('metrics.activity.description')}</CardDescription>
      </div>

      <div className="flex h-48 items-end gap-1.5 overflow-x-auto pb-2">
        {daily.map((day) => {
          const total =
            day.dealsCreated + day.movements + day.updates + day.deletions + day.whatsappMessages;
          const height = `${Math.max(8, (total / maxTotal) * 100)}%`;
          const label = new Intl.DateTimeFormat(locale, {
            day: '2-digit',
            month: '2-digit',
          }).format(new Date(`${day.date}T00:00:00`));

          return (
            <div key={day.date} className="flex min-w-8 flex-1 flex-col items-center gap-2">
              <div className="flex h-36 w-full items-end">
                <div
                  className="w-full rounded-t-md bg-zinc-900 transition-all dark:bg-zinc-100"
                  style={{ height }}
                  title={`${label}: ${total}`}
                />
              </div>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500">{label}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
