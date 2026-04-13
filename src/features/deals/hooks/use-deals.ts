import { useQuery } from '@tanstack/react-query';
import { fetchDeals } from '../api/deals-api';

type UseDealsOptions = {
  authScope: string | undefined;
  enabled?: boolean;
};

export function useDeals({ authScope, enabled = true }: UseDealsOptions) {
  return useQuery({
    queryKey: ['deals', authScope],
    queryFn: fetchDeals,
    enabled: enabled && Boolean(authScope),
  });
}
