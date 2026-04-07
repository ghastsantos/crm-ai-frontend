import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { logoutRequest } from '@/features/auth/api/auth-api';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { useSession } from '@/features/auth/hooks/use-session';
import { env } from '@/shared/config/env';
import { Button } from '@/shared/ui/button';

export function AppHeader() {
  const { clearLocalSession } = useSession();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data, isPending, isError } = useCurrentUser();

  async function handleLogout() {
    if (env.VITE_AUTH_HTTPONLY_COOKIE) {
      try {
        await logoutRequest();
      } catch {
        /* servidor indisponível: limpar sessão local na mesma */
      }
    }
    clearLocalSession();
    queryClient.removeQueries({ queryKey: ['me'] });
    navigate('/login');
  }

  let label: string;
  if (isPending) {
    label = 'Carregando…';
  } else if (isError) {
    label = 'Perfil indisponível';
  } else if (data) {
    label = data.name.trim() || data.email;
  } else {
    label = '';
  }

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <span className="text-xs font-medium uppercase tracking-widest text-zinc-400">CRM</span>
        <div className="flex items-center gap-4">
          {label ? (
            <span className="max-w-[200px] truncate text-xs text-zinc-600">{label}</span>
          ) : null}
          <Button type="button" variant="ghost" className="h-8 px-2 text-xs" onClick={handleLogout}>
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
}
