import type { UserWithMemberships } from '@/entities/user/types';
import { apiRequest } from '@/shared/api/client';

export async function updateMyProfile(body: { name: string }): Promise<UserWithMemberships> {
  return apiRequest<UserWithMemberships>('/api/v1/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function changeMyPassword(body: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  await apiRequest('/api/v1/auth/change-password', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
