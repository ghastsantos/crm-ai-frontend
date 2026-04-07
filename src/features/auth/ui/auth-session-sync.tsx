import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { useSession } from '@/features/auth/hooks/use-session';
import { useSessionActive } from '@/features/auth/hooks/use-session-active';
import { ApiError } from '@/shared/api/client';

export function AuthSessionSync() {
  const navigate = useNavigate();
  const { clearLocalSession } = useSession();
  const active = useSessionActive();
  const { status, error } = useCurrentUser();

  useEffect(() => {
    if (!active) return;
    if (status === 'error' && error instanceof ApiError && error.statusCode === 401) {
      clearLocalSession();
      navigate('/login', { replace: true });
    }
  }, [active, status, error, clearLocalSession, navigate]);

  return null;
}
