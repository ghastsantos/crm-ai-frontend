import type { Organization } from '@/entities/organization/types';
import { apiRequest } from '@/shared/api/client';

export async function fetchOrganizations(): Promise<Organization[]> {
  return apiRequest<Organization[]>('/api/v1/organizations', { method: 'GET' });
}

export async function createOrganization(body: { name: string }): Promise<Organization> {
  return apiRequest<Organization>('/api/v1/organizations', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateOrganization(
  organizationId: string,
  body: { name: string }
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
