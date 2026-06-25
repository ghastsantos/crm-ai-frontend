type Translate = (key: string, vars?: Record<string, string | number>) => string;

const stageKeyByTitle = new Map<string, string>([
  ['lead', 'pipeline.stage.lead'],
  ['lead captado', 'pipeline.stage.lead'],
  ['qualificacao', 'pipeline.stage.qualification'],
  ['qualificacao (mql/icp)', 'pipeline.stage.qualification'],
  ['contato inicial', 'pipeline.stage.initial_contact'],
  ['proposta', 'pipeline.stage.proposal'],
  ['em negociacao', 'pipeline.stage.negotiation'],
  ['negociacao', 'pipeline.stage.negotiation'],
  ['fechamento', 'pipeline.stage.closing'],
  ['nao fechou', 'pipeline.stage.lost'],
]);

function normalizeTitle(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

export function getPipelineColumnNameLabel(title: string | null | undefined, t: Translate): string {
  if (!title) return '';

  const normalized = normalizeTitle(title);
  if (!normalized) return '';

  const stageKey = stageKeyByTitle.get(normalized);
  return stageKey ? t(stageKey) : title;
}
