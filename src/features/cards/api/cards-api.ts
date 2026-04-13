import type { Card, CardStage } from '@/entities/card/types';
import { apiRequest } from '@/shared/api/client';

type RawCard = Omit<Card, 'value'> & { value: string | null };

export type CreateCardInput = {
  title: string;
  organizationId: string;
  stage?: CardStage;
  value?: number | null;
  companyName?: string | null;
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
};

export type ListCardsParams = {
  organizationId: string;
  stage?: CardStage;
};

export async function fetchCards(params: ListCardsParams): Promise<Card[]> {
  const search = new URLSearchParams();
  search.set('organizationId', params.organizationId);
  if (params.stage) search.set('stage', params.stage);
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

function buildCreateBody(input: CreateCardInput): Record<string, unknown> {
  const body: Record<string, unknown> = {
    title: input.title,
    organizationId: input.organizationId,
  };
  if (input.stage) body.stage = input.stage;
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
