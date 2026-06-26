import { formatCurrency } from '@/features/cards/lib/format-currency';
import { useLocale } from '@/features/locale/hooks/use-locale';
import { Card, CardDescription, CardTitle } from '@/shared/ui/card';
import type { MetricsOverview } from '../api/metrics-api';

type Props = {
  overview: MetricsOverview;
};

type AttentionItem = {
  label: string;
  tone: 'warning' | 'danger' | 'neutral';
};

export function OperationalPanels({ overview }: Props) {
  const { t, locale } = useLocale();
  const whatsappMessages =
    overview.whatsapp.inboundMessagesInRange + overview.whatsapp.outboundMessagesInRange;
  const activeProductShare = ratio(overview.products.active, overview.products.total);
  const attention = getAttentionItems(overview, t);

  return (
    <div className="grid gap-4">
      <Card className="space-y-5">
        <div>
          <CardTitle>{t('metrics.whatsapp.title')}</CardTitle>
          <CardDescription>{statusLabel(overview.whatsapp.status, t)}</CardDescription>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <Fact
            label={t('metrics.whatsapp.active_conversations')}
            value={formatNumber(overview.whatsapp.activeConversationsInRange, locale)}
          />
          <Fact
            label={t('metrics.whatsapp.total_messages')}
            value={formatNumber(whatsappMessages, locale)}
          />
        </div>

        <div className="space-y-3">
          <ShareBar
            label={t('metrics.whatsapp.inbound')}
            value={overview.whatsapp.inboundMessagesInRange}
            total={Math.max(whatsappMessages, 1)}
            color="#2563eb"
          />
          <ShareBar
            label={t('metrics.whatsapp.outbound')}
            value={overview.whatsapp.outboundMessagesInRange}
            total={Math.max(whatsappMessages, 1)}
            color="#0f766e"
          />
          <ShareBar
            label={t('metrics.whatsapp.failed')}
            value={overview.whatsapp.failedMessagesInRange}
            total={Math.max(whatsappMessages, overview.whatsapp.failedMessagesInRange, 1)}
            color="#dc2626"
          />
        </div>

        <dl className="grid gap-2 border-t border-zinc-200 pt-4 text-xs dark:border-zinc-800">
          <InlineFact
            label={t('metrics.whatsapp.connected_phone')}
            value={overview.whatsapp.connectedPhone ?? '-'}
          />
          <InlineFact
            label={t('metrics.whatsapp.last_message')}
            value={
              overview.whatsapp.lastMessageAt
                ? new Intl.DateTimeFormat(locale, {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  }).format(new Date(overview.whatsapp.lastMessageAt))
                : '-'
            }
          />
        </dl>
      </Card>

      <Card className="space-y-5">
        <div>
          <CardTitle>{t('metrics.base.title')}</CardTitle>
          <CardDescription>{t('metrics.base.description')}</CardDescription>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <Fact
            label={t('metrics.products.title')}
            value={formatNumber(overview.products.total, locale)}
          />
          <Fact
            label={t('metrics.team.title')}
            value={formatNumber(overview.team.totalMembers, locale)}
          />
        </div>

        <div className="space-y-3">
          <ShareBar
            label={t('metrics.products.active')}
            value={overview.products.active}
            total={Math.max(overview.products.total, 1)}
            color="#0f766e"
            hint={formatPercent(activeProductShare)}
          />
          <ShareBar
            label={t('metrics.team.employees')}
            value={overview.team.totalMembers}
            total={Math.max(overview.team.totalMembers, 1)}
            color="#7c3aed"
          />
        </div>

        <dl className="grid gap-2 border-t border-zinc-200 pt-4 text-xs dark:border-zinc-800">
          <InlineFact
            label={t('metrics.products.average_price')}
            value={
              overview.products.averagePrice
                ? formatCurrency(Number(overview.products.averagePrice))
                : '-'
            }
          />
          <InlineFact
            label={t('metrics.products.inactive')}
            value={formatNumber(overview.products.inactive, locale)}
          />
        </dl>
      </Card>

      <Card className="space-y-4">
        <div>
          <CardTitle>{t('metrics.attention.title')}</CardTitle>
          <CardDescription>{t('metrics.attention.description')}</CardDescription>
        </div>

        {attention.length > 0 ? (
          <ul className="space-y-2">
            {attention.map((item) => (
              <li
                key={item.label}
                className="flex gap-2 rounded-md border border-zinc-200 px-3 py-2 text-xs leading-5 text-zinc-700 dark:border-zinc-800 dark:text-zinc-300"
              >
                <span
                  className="mt-1 h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: attentionColor(item.tone) }}
                  aria-hidden="true"
                />
                {item.label}
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-md border border-zinc-200 px-3 py-2 text-xs leading-5 text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            {t('metrics.attention.empty')}
          </p>
        )}
      </Card>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-zinc-200 px-3 py-2 dark:border-zinc-800">
      <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
        {label}
      </p>
      <p className="mt-1 font-semibold text-zinc-950 dark:text-zinc-50">{value}</p>
    </div>
  );
}

function InlineFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="font-medium text-zinc-950 dark:text-zinc-50">{value}</dd>
    </div>
  );
}

function ShareBar({
  label,
  value,
  total,
  color,
  hint,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
  hint?: string;
}) {
  const percent = ratio(value, total);

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
        <span className="text-zinc-500 dark:text-zinc-400">{label}</span>
        <span className="font-medium text-zinc-950 dark:text-zinc-50">
          {value}
          {hint ? ` · ${hint}` : null}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.max(value > 0 ? 5 : 0, percent * 100)}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}

function getAttentionItems(
  overview: MetricsOverview,
  t: (key: string, vars?: Record<string, string | number>) => string
) {
  const items: AttentionItem[] = [];

  if (overview.pipeline.dealsWithoutValue > 0) {
    items.push({
      tone: 'warning',
      label: t('metrics.attention.deals_without_value', {
        count: overview.pipeline.dealsWithoutValue,
      }),
    });
  }

  if (overview.whatsapp.failedMessagesInRange > 0) {
    items.push({
      tone: 'danger',
      label: t('metrics.attention.failed_whatsapp', {
        count: overview.whatsapp.failedMessagesInRange,
      }),
    });
  }

  if (overview.whatsapp.status !== 'CONNECTED') {
    items.push({
      tone: 'warning',
      label: t('metrics.attention.whatsapp_not_connected'),
    });
  }

  if (overview.products.inactive > 0) {
    items.push({
      tone: 'neutral',
      label: t('metrics.attention.inactive_products', {
        count: overview.products.inactive,
      }),
    });
  }

  if (overview.team.totalMembers <= 1) {
    items.push({
      tone: 'neutral',
      label: t('metrics.attention.small_team'),
    });
  }

  return items;
}

function statusLabel(status: string, t: (key: string) => string) {
  const labels: Record<string, string> = {
    CONNECTED: t('metrics.whatsapp.status.connected'),
    CONNECTING: t('metrics.whatsapp.status.connecting'),
    DISCONNECTED: t('metrics.whatsapp.status.disconnected'),
    NOT_CONFIGURED: t('metrics.whatsapp.status.not_configured'),
  };

  return labels[status] ?? status;
}

function attentionColor(tone: AttentionItem['tone']) {
  if (tone === 'danger') return '#dc2626';
  if (tone === 'warning') return '#d97706';
  return '#71717a';
}

function ratio(part: number, total: number) {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(1, part / total));
}

function formatNumber(value: number, locale: string) {
  return new Intl.NumberFormat(locale).format(value);
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}
