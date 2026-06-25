import { formatCurrency } from '@/features/cards/lib/format-currency';
import { useLocale } from '@/features/locale/hooks/use-locale';
import { Card, CardDescription, CardTitle } from '@/shared/ui/card';
import type { MetricsOverview } from '../api/metrics-api';

type Props = {
  overview: MetricsOverview;
};

export function OperationalPanels({ overview }: Props) {
  const { t } = useLocale();

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Panel
        title={t('metrics.whatsapp.title')}
        description={overview.whatsapp.status}
        rows={[
          [t('metrics.whatsapp.connected_phone'), overview.whatsapp.connectedPhone ?? '-'],
          [t('metrics.whatsapp.conversations'), String(overview.whatsapp.conversations)],
          [t('metrics.whatsapp.inbound'), String(overview.whatsapp.inboundMessagesInRange)],
          [t('metrics.whatsapp.outbound'), String(overview.whatsapp.outboundMessagesInRange)],
          [t('metrics.whatsapp.failed'), String(overview.whatsapp.failedMessagesInRange)],
        ]}
      />
      <Panel
        title={t('metrics.products.title')}
        description={t('metrics.products.description')}
        rows={[
          [t('metrics.products.total'), String(overview.products.total)],
          [t('metrics.products.active'), String(overview.products.active)],
          [t('metrics.products.inactive'), String(overview.products.inactive)],
          [
            t('metrics.products.average_price'),
            overview.products.averagePrice
              ? formatCurrency(Number(overview.products.averagePrice))
              : '-',
          ],
        ]}
      />
      <Panel
        title={t('metrics.team.title')}
        description={t('metrics.team.description')}
        rows={[
          [t('metrics.team.total'), String(overview.team.totalMembers)],
          [t('metrics.team.owners'), String(overview.team.owners)],
          [t('metrics.team.members'), String(overview.team.members)],
        ]}
      />
    </div>
  );
}

function Panel({
  title,
  description,
  rows,
}: {
  title: string;
  description: string;
  rows: Array<[string, string]>;
}) {
  return (
    <Card>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
      <dl className="mt-5 space-y-3">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 text-sm">
            <dt className="text-zinc-500 dark:text-zinc-400">{label}</dt>
            <dd className="font-medium text-zinc-900 dark:text-zinc-100">{value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
