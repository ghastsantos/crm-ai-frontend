import type { CardStage } from '@/entities/card/types';

export function cardStageLabel(stage: CardStage): string {
  if (stage === 'LEAD_CAPTADO') return 'Lead captado';
  if (stage === 'QUALIFICACAO_MQL_ICP') return 'Qualificação (MQL/ICP)';
  if (stage === 'CONTATO_INICIAL') return 'Contato inicial';
  if (stage === 'PROPOSTA') return 'Proposta';
  if (stage === 'NEGOCIACAO') return 'Negociação';
  if (stage === 'FECHAMENTO') return 'Fechamento';
  return stage;
}
