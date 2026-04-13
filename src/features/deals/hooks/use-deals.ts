import { useQuery } from '@tanstack/react-query';
import { fetchDeals } from '../api/deals-api';

export function useDeals() {
  return useQuery({
    queryKey: ['deals'],
    queryFn: fetchDeals,
  });
}
