import { useQueryClient } from '@tanstack/react-query';
import { NavLink, useNavigate } from 'react-router-dom';
import { logoutRequest } from '@/features/auth/api/auth-api';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { useSession } from '@/features/auth/hooks/use-session';
import { useLocale } from '@/features/locale/hooks/use-locale';
import { useActiveOrganization } from '@/features/organizations/hooks/use-active-organization';
import { OrganizationSwitcher } from '@/features/organizations/ui/organization-switcher';
import { env } from '@/shared/config/env';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';

export function AppHeader() {
  const { clearLocalSession } = useSession();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data, isPending, isError } = useCurrentUser();
  const { active } = useActiveOrganization();
  const { t } = useLocale();
  const isAdmin = active?.isOwner === true;
  const roleLabel = active ? (isAdmin ? 'Admin' : 'Usuario') : '';

  async function handleLogout() {
    if (env.VITE_AUTH_HTTPONLY_COOKIE) {
      try {
        await logoutRequest();
      } catch {
        /* servidor indisponivel: limpar sessao local da mesma forma */
      }
    }

    clearLocalSession();
    queryClient.removeQueries({ queryKey: ['me'] });
    navigate('/login');
  }

  let label: string;

  if (isPending) {
    label = 'Carregando...';
  } else if (isError) {
    label = 'Perfil indisponivel';
  } else if (data) {
    label = data.name.trim() || data.email;
  } else {
    label = '';
  }

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 shadow-[0_8px_30px_-24px_rgba(0,0,0,0.35)] backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 lg:max-w-[1600px] lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <NavLink
            to="/"
            aria-label="Ir para o menu inicial"
            title="Ir para o menu inicial"
            className={({ isActive }) =>
              cn(
                'group inline-flex h-10 items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3 pr-4 text-sm font-semibold tracking-[0.16em] text-zinc-800 shadow-sm transition-all duration-200',
                'hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 hover:shadow-md',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300',
                'dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-700 dark:hover:bg-zinc-800 dark:focus-visible:ring-zinc-700',
                isActive &&
                  'border-zinc-300 bg-zinc-50 text-zinc-950 shadow-md dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100'
              )
            }
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-950 text-[11px] font-bold tracking-normal text-white shadow-sm transition-transform duration-200 group-hover:scale-105 dark:bg-zinc-100 dark:text-zinc-950">
              AI
            </span>
            <span>CRM AI</span>
          </NavLink>

          <div className="hidden h-6 w-px bg-zinc-200 dark:bg-zinc-800 sm:block" />

          <div className="min-w-0">
            <OrganizationSwitcher />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {isAdmin ? (
            <>
              <NavLink
                to="/admin/members"
                className={({ isActive }) =>
                  cn(
                    'hidden h-9 items-center rounded-xl border border-transparent px-3 text-xs font-medium text-zinc-500 transition-all duration-200 sm:inline-flex',
                    'hover:border-zinc-200 hover:bg-zinc-50 hover:text-zinc-950 hover:shadow-sm',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300',
                    'dark:text-zinc-400 dark:hover:border-zinc-800 dark:hover:bg-zinc-900 dark:hover:text-zinc-100 dark:focus-visible:ring-zinc-700',
                    isActive &&
                      'border-zinc-200 bg-zinc-50 text-zinc-950 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100'
                  )
                }
                aria-label="Acessar membros da organizacao"
                title="Acessar membros da organizacao"
              >
                Membros
              </NavLink>

              <NavLink
                to="/admin/pipeline-logs"
                className={({ isActive }) =>
                  cn(
                    'hidden h-9 items-center rounded-xl border border-transparent px-3 text-xs font-medium text-zinc-500 transition-all duration-200 sm:inline-flex',
                    'hover:border-zinc-200 hover:bg-zinc-50 hover:text-zinc-950 hover:shadow-sm',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300',
                    'dark:text-zinc-400 dark:hover:border-zinc-800 dark:hover:bg-zinc-900 dark:hover:text-zinc-100 dark:focus-visible:ring-zinc-700',
                    isActive &&
                      'border-zinc-200 bg-zinc-50 text-zinc-950 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100'
                  )
                }
                aria-label="Acessar logs do pipeline"
                title="Acessar logs do pipeline"
              >
                Logs
              </NavLink>
            </>
          ) : null}

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                'inline-flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-zinc-500 transition-all duration-200',
                'hover:border-zinc-200 hover:bg-zinc-50 hover:text-zinc-950 hover:shadow-sm',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300',
                'dark:text-zinc-400 dark:hover:border-zinc-800 dark:hover:bg-zinc-900 dark:hover:text-zinc-100 dark:focus-visible:ring-zinc-700',
                isActive &&
                  'border-zinc-200 bg-zinc-50 text-zinc-950 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100'
              )
            }
            aria-label={t('app.settings')}
            title={t('app.settings')}
          >
            <SettingsIcon />
          </NavLink>

          {label ? (
            <div className="hidden max-w-[260px] items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 sm:flex">
              <span
                className={cn(
                  'h-1.5 w-1.5 shrink-0 rounded-full',
                  isAdmin ? 'bg-zinc-950 dark:bg-zinc-100' : 'bg-zinc-400'
                )}
              />

              <span className="truncate">{label}</span>

              {roleLabel ? (
                <span className="ml-1 rounded-md border border-zinc-200 bg-white px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400">
                  {roleLabel}
                </span>
              ) : null}
            </div>
          ) : null}

          <Button
            type="button"
            variant="ghost"
            className="h-9 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-600 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-zinc-50 hover:text-zinc-950 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            onClick={handleLogout}
          >
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
