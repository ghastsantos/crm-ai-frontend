import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createMember,
  deleteMember,
  fetchMembers,
  type CreateMemberInput,
} from '@/features/members/api/members-api';

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
    mutationFn: (input: CreateMemberInput) => createMember(input),
    onSuccess: (member) => {
      void queryClient.invalidateQueries({ queryKey: ['members', member.organizationId] });
      void queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

export function useDeleteMember(organizationId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => deleteMember(memberId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['members', organizationId] });
      void queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}
