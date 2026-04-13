export type CardStage =
  | 'LEAD_CAPTADO'
  | 'QUALIFICACAO_MQL_ICP'
  | 'CONTATO_INICIAL'
  | 'PROPOSTA'
  | 'NEGOCIACAO'
  | 'FECHAMENTO';

export const CARD_STAGES: CardStage[] = [
  'LEAD_CAPTADO',
  'QUALIFICACAO_MQL_ICP',
  'CONTATO_INICIAL',
  'PROPOSTA',
  'NEGOCIACAO',
  'FECHAMENTO',
];

export type Card = {
  id: string;
  title: string;
  stage: CardStage;
  value: number | null;
  companyName: string | null;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
  organizationId: string;
  contactId: string | null;
  createdAt: string;
  updatedAt: string;
};
