import type { DealStage } from '@/entities/deal/types';

export function dealStageLabel(stage: DealStage): string {
  if (stage === 'lead') return 'Lead captado';
  if (stage === 'qualification') return 'Qualificação (MQL/ICP)';
  if (stage === 'initial_contact') return 'Contato inicial';
  if (stage === 'proposal') return 'Proposta';
  if (stage === 'negotiation') return 'Negociação';
  if (stage === 'closing') return 'Fechamento';
  return stage;
}
