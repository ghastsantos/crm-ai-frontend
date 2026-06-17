import type { OrganizationMember } from '@/entities/member/types';
import { apiRequest } from '@/shared/api/client';

export async function fetchMembers(organizationId: string): Promise<OrganizationMember[]> {
  const params = new URLSearchParams();

  params.set('organizationId', organizationId);

  return apiRequest<OrganizationMember[]>(`/api/v1/members?${params.toString()}`, {
    method: 'GET',
  });
}

export async function createMember(input: {
  organizationId: string;
  name: string;
  email: string;
  password: string;
}): Promise<OrganizationMember> {
  return apiRequest<OrganizationMember>('/api/v1/members', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function deleteMember(id: string): Promise<void> {
  return apiRequest<void>(`/api/v1/members/${id}`, {
    method: 'DELETE',
  });
}
