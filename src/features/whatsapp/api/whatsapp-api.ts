import type { Card } from '@/entities/card/types';
import { apiRequest } from '@/shared/api/client';

export type WhatsAppStage = 'LEAD' | 'QUALIFICACAO' | 'EM_NEGOCIACAO' | 'FECHAMENTO' | 'NAO_FECHOU';

export type WhatsAppConnectionStatus =
  | 'NOT_CONFIGURED'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'DISCONNECTED';

export type WhatsAppIntegration = {
  id: string | null;
  instanceName: string;
  status: WhatsAppConnectionStatus;
  qrCode: string | null;
  pairingCode: string | null;
  connectedPhone: string | null;
  lastWebhookAt: string | null;
  lastConnectedAt: string | null;
  organizationId: string | null;
  organization: { id: string; name: string } | null;
};

export type WhatsAppConversation = {
  id: string;
  organizationId: string;
  phone: string;
  contactName: string | null;
  dealId: string | null;
  stage: WhatsAppStage | null;
  summary: string | null;
  nextStep: string | null;
  lastReply: string | null;
  lastMessageAt: string | null;
  deal: Pick<Card, 'id' | 'title' | 'pipelineColumnId'> | null;
  messages: Array<{
    id: string;
    direction: 'INBOUND' | 'OUTBOUND';
    status: 'RECEIVED' | 'SENT' | 'IGNORED' | 'FAILED';
    text: string;
    responseText: string | null;
    error: string | null;
    createdAt: string;
  }>;
};

export type WhatsAppMessageInput = {
  organizationId: string;
  phone: string;
  contactName?: string;
  message: string;
};

export type WhatsAppMessageResult = {
  card: Card;
  created: boolean;
  analysis: {
    stage: WhatsAppStage;
    summary: string;
    nextStep: string;
    suggestedReply: string;
  };
};

type RawCard = Omit<Card, 'value'> & { value: string | null };

type RawWhatsAppMessageResult = Omit<WhatsAppMessageResult, 'card'> & {
  card: RawCard;
};

export async function fetchWhatsAppIntegration(): Promise<WhatsAppIntegration> {
  return apiRequest<WhatsAppIntegration>('/api/v1/whatsapp/integration');
}

export async function setupWhatsAppIntegration(
  organizationId: string
): Promise<WhatsAppIntegration> {
  return apiRequest<WhatsAppIntegration>('/api/v1/whatsapp/integration/setup', {
    method: 'POST',
    body: JSON.stringify({ organizationId }),
  });
}

export async function connectWhatsAppIntegration(): Promise<WhatsAppIntegration> {
  return apiRequest<WhatsAppIntegration>('/api/v1/whatsapp/integration/connect', {
    method: 'POST',
  });
}

export async function fetchWhatsAppConversations(
  organizationId: string
): Promise<WhatsAppConversation[]> {
  return apiRequest<WhatsAppConversation[]>(
    `/api/v1/whatsapp/conversations?organizationId=${encodeURIComponent(organizationId)}`
  );
}

export async function processWhatsAppMessage(
  input: WhatsAppMessageInput
): Promise<WhatsAppMessageResult> {
  const raw = await apiRequest<RawWhatsAppMessageResult>('/api/v1/whatsapp/messages', {
    method: 'POST',
    body: JSON.stringify(input),
  });

  return {
    ...raw,
    card: {
      ...raw.card,
      value: raw.card.value != null ? Number(raw.card.value) : null,
    },
  };
}
