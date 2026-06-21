import type { LocaleContextValue } from '@/features/locale/model/locale-context';
import type { PipelineColumn } from './types';

type Translate = LocaleContextValue['t'];

const stages = [
  {
    position: 0,
    key: 'pipeline.stage.lead',
    terms: ['lead'],
  },
  {
    position: 1,
    key: 'pipeline.stage.qualification',
    terms: ['qualificacao', 'qualification'],
  },
  {
    position: 2,
    key: 'pipeline.stage.negotiation',
    terms: ['em negociacao', 'negotiation', 'in negotiation'],
  },
  {
    position: 3,
    key: 'pipeline.stage.closing',
    terms: ['fechamento', 'closing', 'closed', 'won'],
  },
  {
    position: 4,
    key: 'pipeline.stage.lost',
    terms: ['nao fechou', 'lost', 'not closed'],
  },
] as const;

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function getPipelineColumnLabel(column: PipelineColumn, t: Translate): string {
  const stage = stages.find((item) => item.position === column.position);
  return stage ? t(stage.key) : column.title;
}

export function getPipelineColumnNameLabel(name: string | null | undefined, t: Translate): string {
  if (!name) return '';

  const normalized = normalize(name);
  const stage = stages.find((item) => item.terms.some((term) => normalized.includes(term)));

  return stage ? t(stage.key) : name;
}
