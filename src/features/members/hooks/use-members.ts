import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createMember, deleteMember, fetchMembers } from '@/features/members/api/members-api';

export function useMembers(organizationId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['members', organizationId],
    queryFn: () => fetchMembers(organizationId as string),
    enabled: Boolean(organizationId) && enabled,
  });
}

export function useCreateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMember,
    onSuccess: (member) => {
      queryClient.invalidateQueries({
        queryKey: ['members', member.organizationId],
      });

      queryClient.invalidateQueries({
        queryKey: ['me'],
      });
    },
  });
}

export function useDeleteMember(organizationId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMember,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['members', organizationId],
      });

      queryClient.invalidateQueries({
        queryKey: ['me'],
      });
    },
  });
}
