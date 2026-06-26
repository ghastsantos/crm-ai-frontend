import type { Organization, PixKeyType } from '@/entities/organization/types';
import { apiRequest } from '@/shared/api/client';

export type CreateOrganizationUserInput = {
  email: string;
  password: string;
  name: string;
  role: 'OWNER' | 'MEMBER';
};

export type UpdateOrganizationInput = {
  name?: string;
  niche?: string;
  pixKey?: string | null;
  pixKeyType?: PixKeyType | null;
};

export type OrganizationUser = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  membership: {
    id: string;
    role: string;
    organizationId: string;
  };
};

export async function fetchOrganizations(): Promise<Organization[]> {
  return apiRequest<Organization[]>('/api/v1/organizations', { method: 'GET' });
}

export async function createOrganization(body: {
  name: string;
  niche: string;
}): Promise<Organization> {
  return apiRequest<Organization>('/api/v1/organizations', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateOrganization(
  organizationId: string,
  body: UpdateOrganizationInput
): Promise<Organization> {
  return apiRequest<Organization>(`/api/v1/organizations/${organizationId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function deleteOrganization(organizationId: string): Promise<void> {
  await apiRequest(`/api/v1/organizations/${organizationId}`, {
    method: 'DELETE',
  });
}

export async function createOrganizationUser(
  organizationId: string,
  body: CreateOrganizationUserInput
): Promise<OrganizationUser> {
  return apiRequest<OrganizationUser>(`/api/v1/organizations/${organizationId}/users`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
