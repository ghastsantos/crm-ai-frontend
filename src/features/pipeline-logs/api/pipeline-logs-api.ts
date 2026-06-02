import { apiRequest } from '@/shared/api/client';

export type ApiPipelineLogAction =
  | 'DEAL_CREATED'
  | 'DEAL_MOVED'
  | 'DEAL_UPDATED'
  | 'DEAL_ARCHIVED'
  | 'DEAL_DELETED'
  | 'OWNER_CHANGED'
  | 'COLUMN_CREATED'
  | 'COLUMN_UPDATED'
  | 'COLUMN_DELETED';

export type PipelineLog = {
  id: string;
  organizationId: string;
  userId: string | null;
  dealId: string | null;
  action: ApiPipelineLogAction;
  description: string;
  fromColumnId: string | null;
  toColumnId: string | null;
  fromColumnName: string | null;
  toColumnName: string | null;
  previousValue: string | null;
  newValue: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
  organization?: {
    id: string;
    name: string;
  } | null;
  deal?: {
    id: string;
    title: string;
  } | null;
};

export type ListPipelineLogsParams = {
  organizationId: string;
  action?: ApiPipelineLogAction;
  search?: string;
  limit?: number;
};

export async function fetchPipelineLogs(params: ListPipelineLogsParams): Promise<PipelineLog[]> {
  const search = new URLSearchParams();

  search.set('organizationId', params.organizationId);

  if (params.action) {
    search.set('action', params.action);
  }

  if (params.search) {
    search.set('search', params.search);
  }

  if (params.limit) {
    search.set('limit', String(params.limit));
  }

  return apiRequest<PipelineLog[]>(`/api/v1/pipeline-logs?${search.toString()}`, {
    method: 'GET',
  });
}