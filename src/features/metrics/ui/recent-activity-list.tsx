import { useLocale } from '@/features/locale/hooks/use-locale';
import { Card, CardDescription, CardTitle } from '@/shared/ui/card';
import type { MetricsOverview } from '../api/metrics-api';

type Props = {
  recent: MetricsOverview['activity']['recent'];
};

const actionKeys: Record<string, string> = {
  DEAL_CREATED: 'logs.actions.card_created',
  DEAL_MOVED: 'logs.actions.card_moved',
  DEAL_UPDATED: 'logs.actions.card_updated',
  DEAL_ARCHIVED: 'logs.actions.card_archived',
  DEAL_DELETED: 'logs.actions.card_deleted',
  OWNER_CHANGED: 'logs.actions.owner_changed',
  COLUMN_CREATED: 'logs.actions.column_created',
  COLUMN_UPDATED: 'logs.actions.column_updated',
  COLUMN_DELETED: 'logs.actions.column_deleted',
};

export function RecentActivityList({ recent }: Props) {
  const { t, locale } = useLocale();

  return (
    <Card className="space-y-5">
      <div>
        <CardTitle>{t('metrics.recent.title')}</CardTitle>
        <CardDescription>{t('metrics.recent.description')}</CardDescription>
      </div>

      {recent.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('metrics.recent.empty')}</p>
      ) : (
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {recent.map((item) => (
            <div key={item.id} className="grid gap-1 py-3 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {item.dealTitle ?? t('logs.unknown.deal')}
                </p>
                <span className="shrink-0 text-xs text-zinc-400 dark:text-zinc-500">
                  {new Intl.DateTimeFormat(locale, {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  }).format(new Date(item.createdAt))}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {t(actionKeys[item.action] ?? 'logs.actions.all')} · {item.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
