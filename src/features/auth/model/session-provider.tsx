import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { getAuthToken, setAuthToken as persistBearerToken } from '@/shared/api/client';
import { SessionContext } from './session-context';

const COOKIE_SESSION_KEY = 'crm_cookie_session';

function readCookieFlag(): boolean {
  try {
    return sessionStorage.getItem(COOKIE_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

function writeCookieFlag(active: boolean): void {
  try {
    if (active) sessionStorage.setItem(COOKIE_SESSION_KEY, '1');
    else sessionStorage.removeItem(COOKIE_SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [bearerToken, setBearerTokenState] = useState<string | null>(() =>
    typeof window === 'undefined' ? null : getAuthToken()
  );
  const [cookieBacked, setCookieBacked] = useState<boolean>(() =>
    typeof window === 'undefined' ? false : readCookieFlag()
  );

  const setBearerToken = useCallback((token: string | null) => {
    persistBearerToken(token);
    setBearerTokenState(token);
    if (token) {
      writeCookieFlag(false);
      setCookieBacked(false);
    }
  }, []);

  const markCookieBackedSession = useCallback(() => {
    writeCookieFlag(true);
    setCookieBacked(true);
    persistBearerToken(null);
    setBearerTokenState(null);
  }, []);

  const clearLocalSession = useCallback(() => {
    persistBearerToken(null);
    setBearerTokenState(null);
    writeCookieFlag(false);
    setCookieBacked(false);
  }, []);

  const value = useMemo(
    () => ({
      bearerToken,
      cookieBacked,
      setBearerToken,
      markCookieBackedSession,
      clearLocalSession,
    }),
    [bearerToken, cookieBacked, setBearerToken, markCookieBackedSession, clearLocalSession]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
