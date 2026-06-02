import type { Card } from '@/entities/card/types';
import { apiRequest } from '@/shared/api/client';

type RawCard = Omit<Card, 'value'> & { value: string | null };

export type CreateCardInput = {
  title: string;
  organizationId: string;
  pipelineColumnId: string;
  value?: number | null;
  companyName?: string | null;
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
};

export type ListCardsParams = {
  organizationId: string;
  pipelineColumnId?: string;
};

export type UpdateCardInput = {
  title?: string;
  pipelineColumnId?: string;
  value?: number | null;
  companyName?: string | null;
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
};

export async function fetchCards(params: ListCardsParams): Promise<Card[]> {
  const search = new URLSearchParams();
  search.set('organizationId', params.organizationId);
  if (params.pipelineColumnId) search.set('pipelineColumnId', params.pipelineColumnId);
  const raw = await apiRequest<RawCard[]>(`/api/v1/cards?${search.toString()}`, {
    method: 'GET',
  });
  return raw.map(toCard);
}

export async function createCard(input: CreateCardInput): Promise<Card> {
  const body = buildCreateBody(input);
  const raw = await apiRequest<RawCard>('/api/v1/cards', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return toCard(raw);
}

export async function updateCard(cardId: string, input: UpdateCardInput): Promise<Card> {
  const raw = await apiRequest<RawCard>(`/api/v1/cards/${cardId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return toCard(raw);
}

export type MoveCardInput = {
  pipelineColumnId: string;
  position?: number;
};

export async function moveCard(cardId: string, input: MoveCardInput): Promise<Card> {
  const raw = await apiRequest<RawCard>(`/api/v1/cards/${cardId}/move`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return toCard(raw);
}

export async function deleteCard(cardId: string): Promise<void> {
  await apiRequest(`/api/v1/cards/${cardId}`, {
    method: 'DELETE',
  });
}

function buildCreateBody(input: CreateCardInput): Record<string, unknown> {
  const body: Record<string, unknown> = {
    title: input.title,
    organizationId: input.organizationId,
    pipelineColumnId: input.pipelineColumnId,
  };
  if (input.value != null) body.value = input.value;
  if (input.companyName) body.companyName = input.companyName;
  if (input.contactName) body.contactName = input.contactName;
  if (input.email) body.email = input.email;
  if (input.phone) body.phone = input.phone;
  if (input.notes) body.notes = input.notes;
  return body;
}

function toCard(raw: RawCard): Card {
  return {
    ...raw,
    value: raw.value != null ? Number(raw.value) : null,
  };
}
