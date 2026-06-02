import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createPipelineColumn,
  deletePipelineColumn,
  fetchPipelineColumns,
  updatePipelineColumn,
  type CreatePipelineColumnInput,
  type UpdatePipelineColumnInput,
} from '../api/pipeline-columns-api';

export function usePipelineColumns(organizationId: string | undefined) {
  return useQuery({
    queryKey: ['pipeline-columns', organizationId],
    queryFn: () => fetchPipelineColumns(organizationId as string),
    enabled: Boolean(organizationId),
  });
}

export function useCreatePipelineColumn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePipelineColumnInput) => createPipelineColumn(input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ['pipeline-columns', variables.organizationId],
      });
    },
  });
}

type UpdatePipelineColumnVariables = {
  id: string;
  organizationId: string;
  body: UpdatePipelineColumnInput;
};

export function useUpdatePipelineColumn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: UpdatePipelineColumnVariables) => updatePipelineColumn(id, body),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ['pipeline-columns', variables.organizationId],
      });
      void queryClient.invalidateQueries({ queryKey: ['cards', variables.organizationId] });
    },
  });
}

type DeletePipelineColumnVariables = {
  id: string;
  organizationId: string;
  moveToColumnId?: string;
};

export function useDeletePipelineColumn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, moveToColumnId }: DeletePipelineColumnVariables) =>
      deletePipelineColumn(id, moveToColumnId),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ['pipeline-columns', variables.organizationId],
      });
      void queryClient.invalidateQueries({ queryKey: ['cards', variables.organizationId] });
    },
  });
}
