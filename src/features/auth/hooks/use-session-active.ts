import { env } from '@/shared/config/env';
import { useSession } from './use-session';

export function useSessionActive(): boolean {
  const { bearerToken, cookieBacked } = useSession();
  if (env.VITE_AUTH_HTTPONLY_COOKIE) {
    return Boolean(bearerToken) || cookieBacked;
  }
  return Boolean(bearerToken);
}
