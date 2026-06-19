import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createOrganization,
  createOrganizationUser,
  deleteOrganization,
  fetchOrganizations,
  updateOrganization,
  type CreateOrganizationUserInput,
} from '../api/organizations-api';

export function useOrganizations(enabled = true) {
  return useQuery({
    queryKey: ['organizations'],
    queryFn: fetchOrganizations,
    enabled,
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; niche: string }) => createOrganization(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['organizations'] });
      void queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

export function useRenameOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updateOrganization(id, { name }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['organizations'] });
      void queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => deleteOrganization(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['organizations'] });
      void queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

export function useCreateOrganizationUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      organizationId,
      body,
    }: {
      organizationId: string;
      body: CreateOrganizationUserInput;
    }) => createOrganizationUser(organizationId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}
