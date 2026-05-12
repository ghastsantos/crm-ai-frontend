import { useQuery } from '@tanstack/react-query';
import { fetchPipelineLogs } from '../api/pipeline-logs-api';
import type { ApiPipelineLogAction } from '../api/pipeline-logs-api';

type UsePipelineLogsParams = {
  organizationId: string | undefined;
  action?: ApiPipelineLogAction;
  search?: string;
  limit?: number;
};

export function usePipelineLogs({
  organizationId,
  action,
  search,
  limit = 200,
}: UsePipelineLogsParams) {
  return useQuery({
    queryKey: ['pipeline-logs', organizationId, action, search, limit],
    queryFn: () =>
      fetchPipelineLogs({
        organizationId: organizationId as string,
        action,
        search,
        limit,
      }),
    enabled: Boolean(organizationId),
  });
}