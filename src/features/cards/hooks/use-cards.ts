import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createCard, fetchCards } from '../api/cards-api';

export function useCards(organizationId: string | undefined) {
  return useQuery({
    queryKey: ['cards', organizationId],
    queryFn: () => fetchCards({ organizationId: organizationId as string }),
    enabled: Boolean(organizationId),
  });
}

export function useCreateCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCard,
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['cards', variables.organizationId] });
    },
  });
}
