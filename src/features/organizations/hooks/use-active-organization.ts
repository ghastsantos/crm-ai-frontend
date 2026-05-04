import { useCallback, useEffect, useSyncExternalStore } from 'react';
import type { MembershipSummary } from '@/entities/user/types';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';

const STORAGE_KEY = 'crm.activeOrganizationId';

const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) listener();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

function getSnapshot(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function getServerSnapshot(): string | null {
  return null;
}

function writeStored(id: string | null): void {
  try {
    if (id) localStorage.setItem(STORAGE_KEY, id);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable */
  }
  listeners.forEach((l) => l());
}

export type ActiveOrganization = MembershipSummary & {
  isOwner: boolean;
};

export function useActiveOrganization(): {
  active: ActiveOrganization | null;
  memberships: MembershipSummary[];
  setActive: (organizationId: string) => void;
  clearActive: () => void;
} {
  const storedId = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const { data } = useCurrentUser();
  const memberships = data?.memberships ?? [];

  const fallbackId = memberships[0]?.organizationId ?? null;
  const exists = storedId && memberships.some((m) => m.organizationId === storedId);
  const activeId = exists ? storedId : fallbackId;
  const active = activeId
    ? (() => {
        const m = memberships.find((mem) => mem.organizationId === activeId);
        if (!m) return null;
        return { ...m, isOwner: m.role === 'OWNER' };
      })()
    : null;

  useEffect(() => {
    if (!storedId && fallbackId) {
      writeStored(fallbackId);
      return;
    }
    if (storedId && !exists && fallbackId) {
      writeStored(fallbackId);
    }
    if (storedId && memberships.length === 0) {
      writeStored(null);
    }
  }, [storedId, fallbackId, exists, memberships.length]);

  const setActive = useCallback((organizationId: string) => {
    writeStored(organizationId);
  }, []);

  const clearActive = useCallback(() => {
    writeStored(null);
  }, []);

  return { active, memberships, setActive, clearActive };
}
