import type { PipelineColumn } from '@/entities/pipeline-column/types';
import { apiRequest } from '@/shared/api/client';

export async function fetchPipelineColumns(organizationId: string): Promise<PipelineColumn[]> {
  const search = new URLSearchParams();
  search.set('organizationId', organizationId);
  return apiRequest<PipelineColumn[]>(`/api/v1/pipeline-columns?${search.toString()}`, {
    method: 'GET',
  });
}

export type UpdatePipelineColumnInput = {
  title?: string;
  position?: number;
};

export async function updatePipelineColumn(
  id: string,
  input: UpdatePipelineColumnInput
): Promise<PipelineColumn> {
  return apiRequest<PipelineColumn>(`/api/v1/pipeline-columns/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deletePipelineColumn(id: string, moveToColumnId?: string): Promise<void> {
  const q = new URLSearchParams();
  if (moveToColumnId) q.set('moveToColumnId', moveToColumnId);
  const suffix = q.toString() ? `?${q.toString()}` : '';
  await apiRequest(`/api/v1/pipeline-columns/${id}${suffix}`, {
    method: 'DELETE',
  });
}
