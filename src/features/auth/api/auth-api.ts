import type { AuthPayload, UserWithMemberships } from '@/entities/user/types';
import { apiRequest } from '@/shared/api/client';
import type { LoginFormValues, RegisterFormValues } from '../model/schemas';

export async function loginRequest(body: LoginFormValues): Promise<AuthPayload> {
  return apiRequest<AuthPayload>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
    skipAuth: true,
  });
}

export async function registerRequest(body: RegisterFormValues): Promise<AuthPayload> {
  return apiRequest<AuthPayload>('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
    skipAuth: true,
  });
}

export async function fetchCurrentUser(): Promise<UserWithMemberships> {
  return apiRequest<UserWithMemberships>('/api/v1/auth/me', { method: 'GET' });
}

export async function logoutRequest(): Promise<void> {
  await apiRequest<void>('/api/v1/auth/logout', { method: 'POST' });
}
