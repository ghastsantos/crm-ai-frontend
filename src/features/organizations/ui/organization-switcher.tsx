import { useEffect, useRef, useState } from 'react';
import { useLocale } from '@/features/locale/hooks/use-locale';
import { cn } from '@/shared/lib/cn';
import { useActiveOrganization } from '../hooks/use-active-organization';
import { CreateOrganizationModal } from './create-organization-modal';
import { DeleteOrganizationModal } from './delete-organization-modal';
import { RenameOrganizationModal } from './rename-organization-modal';

export function OrganizationSwitcher() {
  const { t } = useLocale();
  const { active, memberships, setActive, clearActive } = useActiveOrganization();
  const [open, setOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!active) {
    return (
      <>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className={cn(
            'inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-dashed border-zinc-300 px-2 text-xs font-medium tracking-tight text-zinc-600 transition-colors',
            'hover:border-zinc-400 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 dark:focus-visible:ring-zinc-700'
          )}
        >
          <PlusIcon />
          {t('organizations.actions.create')}
        </button>
        <CreateOrganizationModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onCreated={(id) => setActive(id)}
        />
      </>
    );
  }

  return (
    <>
      <div ref={wrapperRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={t('organizations.switcher.label')}
          aria-haspopup="menu"
          aria-expanded={open}
          className={cn(
            'inline-flex h-8 max-w-[220px] cursor-pointer items-center gap-1.5 rounded-md border border-transparent px-2 text-xs font-medium tracking-tight text-zinc-700 transition-colors',
            'hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 dark:focus-visible:ring-zinc-700',
            open && 'bg-zinc-100 dark:bg-zinc-800'
          )}
        >
          <span className="truncate">{active.organizationName}</span>
          <ChevronDown />
        </button>

        {open ? (
          <div
            role="menu"
            className="absolute left-0 top-full z-20 mt-1 w-64 overflow-hidden rounded-md border border-zinc-200 bg-white py-1 shadow-md dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="px-3 pb-1 pt-2 text-[10px] font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              {t('organizations.switcher.label')}
            </p>
            <ul className="max-h-72 overflow-y-auto">
              {memberships.map((m) => {
                const isActive = m.organizationId === active.organizationId;
                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      role="menuitemradio"
                      aria-checked={isActive}
                      onClick={() => {
                        setActive(m.organizationId);
                        setOpen(false);
                      }}
                      className={cn(
                        'flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2 text-left text-xs text-zinc-700 transition-colors',
                        'hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800',
                        isActive && 'bg-zinc-50 dark:bg-zinc-800'
                      )}
                    >
                      <span className="truncate font-medium">{m.organizationName}</span>
                      {isActive ? <CheckIcon /> : null}
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="my-1 border-t border-zinc-200 dark:border-zinc-800" />
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                setCreateOpen(true);
              }}
              className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-xs text-zinc-700 transition-colors hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <PlusIcon />
              {t('organizations.actions.create')}
            </button>
            {active.isOwner ? (
              <>
                <div className="my-1 border-t border-zinc-200 dark:border-zinc-800" />
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    setRenameOpen(true);
                  }}
                  className="block w-full cursor-pointer px-3 py-2 text-left text-xs text-zinc-700 transition-colors hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  {t('organizations.actions.rename')}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    setDeleteOpen(true);
                  }}
                  className="block w-full cursor-pointer px-3 py-2 text-left text-xs text-red-700 transition-colors hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/40"
                >
                  {t('organizations.actions.delete')}
                </button>
              </>
            ) : null}
          </div>
        ) : null}
      </div>

      <RenameOrganizationModal
        open={renameOpen}
        organizationId={active.organizationId}
        initialName={active.organizationName}
        onClose={() => setRenameOpen(false)}
      />

      <DeleteOrganizationModal
        open={deleteOpen}
        organizationId={active.organizationId}
        organizationName={active.organizationName}
        onClose={() => setDeleteOpen(false)}
        onDeleted={() => clearActive()}
      />

      <CreateOrganizationModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(id) => setActive(id)}
      />
    </>
  );
}

function PlusIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0 opacity-70"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0 opacity-60"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0 text-zinc-900 dark:text-zinc-100"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
