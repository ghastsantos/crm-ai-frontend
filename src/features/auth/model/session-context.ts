import { createContext } from 'react';

export type SessionContextValue = {
  bearerToken: string | null;
  cookieBacked: boolean;
  setBearerToken: (token: string | null) => void;
  markCookieBackedSession: () => void;
  clearLocalSession: () => void;
};

export const SessionContext = createContext<SessionContextValue | null>(null);
