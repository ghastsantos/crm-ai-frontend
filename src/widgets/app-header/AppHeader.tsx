import { useQueryClient } from '@tanstack/react-query';
import { NavLink, useNavigate } from 'react-router-dom';
import { logoutRequest } from '@/features/auth/api/auth-api';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { useSession } from '@/features/auth/hooks/use-session';
import { useLocale } from '@/features/locale/hooks/use-locale';
import { OrganizationSwitcher } from '@/features/organizations/ui/organization-switcher';
import { env } from '@/shared/config/env';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';

export function AppHeader() {
  const { clearLocalSession } = useSession();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data, isPending, isError } = useCurrentUser();
  const { t } = useLocale();

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
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 lg:max-w-[1600px] lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <span className="text-xs font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            {t('app.brand')}
          </span>
          <OrganizationSwitcher />
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                'inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300',
                'dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 dark:focus-visible:ring-zinc-700',
                isActive && 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
              )
            }
            aria-label={t('app.settings')}
            title={t('app.settings')}
          >
            <SettingsIcon />
          </NavLink>
          {label ? (
            <span className="hidden max-w-[200px] truncate text-xs text-zinc-600 dark:text-zinc-400 sm:inline">
              {label}
            </span>
          ) : null}
          <Button type="button" variant="ghost" className="h-8 px-2 text-xs" onClick={handleLogout}>
            {t('app.logout')}
          </Button>
        </div>
      </div>
    </header>
  );
}

function SettingsIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  );
}
