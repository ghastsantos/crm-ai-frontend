import type { OrganizationMember, OrganizationMemberRole } from '@/entities/member/types';
import { apiRequest } from '@/shared/api/client';

export type CreateMemberInput = {
  organizationId: string;
  name: string;
  email: string;
  password: string;
  role: OrganizationMemberRole;
};

export async function fetchMembers(organizationId: string): Promise<OrganizationMember[]> {
  return apiRequest<OrganizationMember[]>(
    `/api/v1/members?organizationId=${encodeURIComponent(organizationId)}`
  );
}

export async function createMember(input: CreateMemberInput): Promise<OrganizationMember> {
  return apiRequest<OrganizationMember>('/api/v1/members', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function deleteMember(memberId: string): Promise<void> {
  await apiRequest(`/api/v1/members/${memberId}`, {
    method: 'DELETE',
  });
}
