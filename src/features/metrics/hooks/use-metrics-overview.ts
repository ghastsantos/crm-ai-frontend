import { useQuery } from '@tanstack/react-query';
import { fetchMetricsOverview } from '../api/metrics-api';
import type { MetricsRangeDays } from '../api/metrics-api';

export function useMetricsOverview(
  organizationId: string | undefined,
  rangeDays: MetricsRangeDays
) {
  return useQuery({
    queryKey: ['metrics-overview', organizationId, rangeDays],
    queryFn: () =>
      fetchMetricsOverview({
        organizationId: organizationId as string,
        rangeDays,
      }),
    enabled: Boolean(organizationId),
  });
}
