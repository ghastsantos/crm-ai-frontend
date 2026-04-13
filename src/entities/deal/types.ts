export type DealStage =
  | 'lead'
  | 'qualification'
  | 'initial_contact'
  | 'proposal'
  | 'negotiation'
  | 'closing';

export const DEAL_STAGES: DealStage[] = [
  'lead',
  'qualification',
  'initial_contact',
  'proposal',
  'negotiation',
  'closing',
];

export type Deal = {
  id: string;
  title: string;
  contactName: string;
  company: string;
  amount: number;
  currency: string;
  stage: DealStage;
  updatedAt: string;
};
