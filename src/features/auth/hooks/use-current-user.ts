import { useQuery } from '@tanstack/react-query';
import { env } from '@/shared/config/env';
import { fetchCurrentUser } from '../api/auth-api';
import { useSession } from './use-session';

export function useCurrentUser() {
  const { bearerToken, cookieBacked } = useSession();
  const enabled = env.VITE_AUTH_HTTPONLY_COOKIE
    ? Boolean(bearerToken) || cookieBacked
    : Boolean(bearerToken);
  return useQuery({
    queryKey: ['me', bearerToken, cookieBacked, env.VITE_AUTH_HTTPONLY_COOKIE],
    queryFn: fetchCurrentUser,
    enabled,
  });
}
