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

const actionColors: Record<string, string> = {
  DEAL_CREATED: '#2563eb',
  DEAL_MOVED: '#0f766e',
  DEAL_UPDATED: '#7c3aed',
  DEAL_ARCHIVED: '#71717a',
  DEAL_DELETED: '#dc2626',
  OWNER_CHANGED: '#d97706',
  COLUMN_CREATED: '#2563eb',
  COLUMN_UPDATED: '#7c3aed',
  COLUMN_DELETED: '#dc2626',
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
        <p className="rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          {t('metrics.recent.empty')}
        </p>
      ) : (
        <ol className="relative space-y-4 before:absolute before:bottom-1 before:left-[5px] before:top-1 before:w-px before:bg-zinc-200 dark:before:bg-zinc-800">
          {recent.map((item) => {
            const color = actionColors[item.action] ?? '#71717a';
            return (
              <li key={item.id} className="relative grid gap-1 pl-6">
                <span
                  className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white dark:ring-zinc-900"
                  style={{ backgroundColor: color }}
                  aria-hidden="true"
                />
                <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-950 dark:text-zinc-50">
                      {item.dealTitle ?? t('logs.unknown.deal')}
                    </p>
                    <p className="mt-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      {t(actionKeys[item.action] ?? 'logs.actions.all')}
                      {item.userName
                        ? ` ${t('metrics.recent.by_user', { name: item.userName })}`
                        : null}
                    </p>
                  </div>
                  <time className="shrink-0 text-xs text-zinc-400 dark:text-zinc-500">
                    {new Intl.DateTimeFormat(locale, {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    }).format(new Date(item.createdAt))}
                  </time>
                </div>
                <p className="text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                  {item.description}
                </p>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}
