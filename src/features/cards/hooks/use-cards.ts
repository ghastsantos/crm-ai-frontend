import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createCard, deleteCard, fetchCards, updateCard } from '../api/cards-api';
import type { CreateCardInput, UpdateCardInput } from '../api/cards-api';

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
    mutationFn: (input: CreateCardInput) => createCard(input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['cards', variables.organizationId] });
    },
  });
}

type UpdateCardVariables = {
  cardId: string;
  organizationId: string;
  body: UpdateCardInput;
};

export function useUpdateCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cardId, body }: UpdateCardVariables) => updateCard(cardId, body),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['cards', variables.organizationId] });
    },
  });
}

type DeleteCardVariables = {
  cardId: string;
  organizationId: string;
};

export function useDeleteCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cardId }: DeleteCardVariables) => deleteCard(cardId),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['cards', variables.organizationId] });
    },
  });
}
