import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Card } from '@/entities/card/types';
import {
  createCard,
  deleteCard,
  fetchCard,
  fetchCards,
  moveCard,
  updateCard,
} from '../api/cards-api';
import type { CreateCardInput, MoveCardInput, UpdateCardInput } from '../api/cards-api';

export function useCards(organizationId: string | undefined) {
  return useQuery({
    queryKey: ['cards', organizationId],
    queryFn: () => fetchCards({ organizationId: organizationId as string }),
    enabled: Boolean(organizationId),
  });
}

export function useCard(cardId: string | undefined) {
  return useQuery({
    queryKey: ['card', cardId],
    queryFn: () => fetchCard(cardId as string),
    enabled: Boolean(cardId),
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
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['card', variables.cardId], data);
      void queryClient.invalidateQueries({ queryKey: ['cards', variables.organizationId] });
      void queryClient.invalidateQueries({ queryKey: ['card', variables.cardId] });
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
      queryClient.removeQueries({ queryKey: ['card', variables.cardId] });
    },
  });
}

type MoveCardVariables = {
  cardId: string;
  organizationId: string;
  body: MoveCardInput;
};

export function useMoveCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cardId, body }: MoveCardVariables) => moveCard(cardId, body),
    onMutate: async ({ cardId, organizationId, body }) => {
      await queryClient.cancelQueries({ queryKey: ['cards', organizationId] });
      const previous = queryClient.getQueryData<Card[]>(['cards', organizationId]);
      if (!previous) return { previous };

      const next = applyOptimisticMove(previous, cardId, body);
      queryClient.setQueryData(['cards', organizationId], next);
      return { previous };
    },
    onError: (_err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['cards', variables.organizationId], context.previous);
      }
    },
    onSettled: (_data, _err, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['cards', variables.organizationId] });
      void queryClient.invalidateQueries({ queryKey: ['card', variables.cardId] });
    },
  });
}

function applyOptimisticMove(cards: Card[], cardId: string, input: MoveCardInput): Card[] {
  const moving = cards.find((c) => c.id === cardId);
  if (!moving) return cards;

  const sourceColumnId = moving.pipelineColumnId;
  const targetColumnId = input.pipelineColumnId;
  const sameColumn = sourceColumnId === targetColumnId;

  const targetCount = cards.filter(
    (c) => c.pipelineColumnId === targetColumnId && c.id !== cardId
  ).length;
  const requested = input.position ?? targetCount;
  const targetPos = Math.max(0, Math.min(requested, targetCount));

  return cards.map((card) => {
    if (card.id === cardId) {
      return { ...card, pipelineColumnId: targetColumnId, position: targetPos };
    }
    if (sameColumn && card.pipelineColumnId === sourceColumnId) {
      const sourcePos = moving.position;
      if (targetPos < sourcePos) {
        if (card.position >= targetPos && card.position < sourcePos) {
          return { ...card, position: card.position + 1 };
        }
      } else {
        if (card.position > sourcePos && card.position <= targetPos) {
          return { ...card, position: card.position - 1 };
        }
      }
      return card;
    }
    if (!sameColumn) {
      if (card.pipelineColumnId === sourceColumnId && card.position > moving.position) {
        return { ...card, position: card.position - 1 };
      }
      if (card.pipelineColumnId === targetColumnId && card.position >= targetPos) {
        return { ...card, position: card.position + 1 };
      }
    }
    return card;
  });
}
