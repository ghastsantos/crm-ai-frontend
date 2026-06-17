import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useChangePassword, useUpdateProfile } from '@/features/account/hooks/use-account';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { useCards } from '@/features/cards/hooks/use-cards';
import { useLocale } from '@/features/locale/hooks/use-locale';
import { type Locale } from '@/features/locale/model/locale-context';
import { useActiveOrganization } from '@/features/organizations/hooks/use-active-organization';
import { CreateOrganizationModal } from '@/features/organizations/ui/create-organization-modal';
import { DeleteOrganizationModal } from '@/features/organizations/ui/delete-organization-modal';
import { RenameOrganizationModal } from '@/features/organizations/ui/rename-organization-modal';
import { usePipelineColumns } from '@/features/pipeline-columns/hooks/use-pipeline-columns';
import { ProductsSettingsPanel } from '@/features/products/ui/products-settings-panel';
import { useTheme } from '@/features/theme/hooks/use-theme';
import { type ThemePreference } from '@/features/theme/model/theme-context';
import { cn } from '@/shared/lib/cn';
import { formatApiError } from '@/shared/lib/format-api-error';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

export function SettingsPage() {
  const { t } = useLocale();

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className={cn(
            'inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium tracking-tight text-zinc-700 transition-colors',
            'hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 dark:focus-visible:ring-zinc-700'
          )}
          aria-label={t('settings.back_to_home')}
        >
          <BackIcon />
          {t('settings.back_to_home')}
        </Link>
        <h1 className="text-lg font-medium tracking-tight text-zinc-900 dark:text-zinc-100 lg:text-xl">
          {t('settings.title')}
        </h1>
      </div>

      <div className="mx-auto grid w-full max-w-3xl auto-rows-min items-stretch gap-4 lg:grid-cols-2">
        <AppearanceSection />
        <LocaleSection />
        <ProfileSection />
        <SecuritySection />
        <WorkspaceSection />
        <ProductsSection />
        <DangerZoneSection />
      </div>
    </div>
  );
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-0.5">
      <h2 className="text-xs font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
        {title}
      </h2>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
    </div>
  );
}

function PillGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (next: T) => void;
}) {
  return (
    <div
      role="radiogroup"
      className="inline-flex rounded-lg border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              'inline-flex h-8 cursor-pointer items-center justify-center rounded-md px-3 text-xs font-medium tracking-tight transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 dark:focus-visible:ring-zinc-700',
              active
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function AppearanceSection() {
  const { t } = useLocale();
  const { preference, setPreference } = useTheme();

  const options: { value: ThemePreference; label: string }[] = [
    { value: 'light', label: t('settings.appearance.light') },
    { value: 'dark', label: t('settings.appearance.dark') },
    { value: 'system', label: t('settings.appearance.system') },
  ];

  return (
    <Card className="space-y-4">
      <SectionHeader
        title={t('settings.appearance.title')}
        description={t('settings.appearance.description')}
      />
      <PillGroup options={options} value={preference} onChange={setPreference} />
    </Card>
  );
}

function LocaleSection() {
  const { t, locale, setLocale } = useLocale();

  const options: { value: Locale; label: string }[] = [
    { value: 'pt-BR', label: t('settings.locale.pt-BR') },
    { value: 'en', label: t('settings.locale.en') },
  ];

  return (
    <Card className="space-y-4">
      <SectionHeader
        title={t('settings.locale.title')}
        description={t('settings.locale.description')}
      />
      <PillGroup options={options} value={locale} onChange={setLocale} />
    </Card>
  );
}

function ProfileSection() {
  const { t } = useLocale();
  const { data } = useCurrentUser();

  return (
    <Card className="space-y-4">
      <SectionHeader
        title={t('settings.profile.title')}
        description={t('settings.profile.description')}
      />
      {data ? (
        <ProfileForm key={data.id} initialName={data.name} email={data.email} />
      ) : (
        <p className="text-xs text-zinc-400 dark:text-zinc-500">{t('app.loading')}</p>
      )}
    </Card>
  );
}

function ProfileForm({ initialName, email }: { initialName: string; email: string }) {
  const { t } = useLocale();
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const mutation = useUpdateProfile();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError(t('settings.profile.too_short'));
      return;
    }
    setError(null);
    mutation.mutate(
      { name: trimmed },
      {
        onSuccess: () => setSavedAt(Date.now()),
        onError: (err: unknown) => setError(formatApiError(err)),
      }
    );
  }

  const showSaved = savedAt !== null && !mutation.isPending && !error;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="profile-name">{t('settings.profile.name')}</Label>
        <Input
          id="profile-name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setSavedAt(null);
          }}
          maxLength={200}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="profile-email">{t('settings.profile.email')}</Label>
        <Input id="profile-email" value={email} disabled readOnly />
      </div>
      <FormFooter
        error={error}
        successMessage={showSaved ? t('settings.profile.saved') : null}
        submitLabel={mutation.isPending ? t('settings.profile.saving') : t('settings.profile.save')}
        submitting={mutation.isPending}
      />
    </form>
  );
}

function SecuritySection() {
  const { t } = useLocale();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const mutation = useChangePassword();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 8) {
      setError(t('settings.security.too_short'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t('settings.security.mismatch'));
      return;
    }
    if (newPassword === currentPassword) {
      setError(t('settings.security.same_as_current'));
      return;
    }
    mutation.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setSavedAt(Date.now());
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        },
        onError: (err: unknown) => setError(formatApiError(err)),
      }
    );
  }

  const showSaved = savedAt !== null && !mutation.isPending && !error;

  return (
    <Card className="space-y-4">
      <SectionHeader
        title={t('settings.security.title')}
        description={t('settings.security.description')}
      />
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="current-password">{t('settings.security.current_password')}</Label>
          <Input
            id="current-password"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value);
              setSavedAt(null);
            }}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="new-password">{t('settings.security.new_password')}</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setSavedAt(null);
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm-password">{t('settings.security.confirm_password')}</Label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setSavedAt(null);
              }}
            />
          </div>
        </div>
        <FormFooter
          error={error}
          successMessage={showSaved ? t('settings.security.saved') : null}
          submitLabel={
            mutation.isPending ? t('settings.security.saving') : t('settings.security.save')
          }
          submitting={mutation.isPending}
        />
      </form>
    </Card>
  );
}

function WorkspaceSection() {
  const { t, locale } = useLocale();
  const { data } = useCurrentUser();
  const { active } = useActiveOrganization();
  const orgId = active?.organizationId;
  const cardsQuery = useCards(orgId);
  const columnsQuery = usePipelineColumns(orgId);
  const [renameOpen, setRenameOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const cardsCount = cardsQuery.data?.length ?? 0;
  const columnsCount = columnsQuery.data?.length ?? 0;
  const membersCount = data?.memberships.length ?? 0;
  const role = active?.role === 'OWNER' ? 'role_owner' : 'role_member';
  const createdAt =
    data && active
      ? data.memberships.find((m) => m.organizationId === active.organizationId)
        ? new Date(data.createdAt).toLocaleDateString(locale, {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : '—'
      : '—';

  return (
    <Card className="space-y-4">
      <SectionHeader
        title={t('settings.workspace.title')}
        description={t('settings.workspace.description')}
      />
      {active ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <Stat label={t('settings.workspace.name_label')} value={active.organizationName} />
            <Stat
              label={t('settings.workspace.role_label')}
              value={t(`settings.workspace.${role}`)}
            />
            <Stat label={t('settings.workspace.cards_count')} value={String(cardsCount)} />
            <Stat label={t('settings.workspace.columns_count')} value={String(columnsCount)} />
            <Stat label={t('settings.workspace.members_count')} value={String(membersCount)} />
            <Stat label={t('settings.workspace.created_at')} value={createdAt} />
          </div>
          <div className="flex flex-wrap gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            {active.role === 'OWNER' ? (
              <Button
                type="button"
                variant="outline"
                className="text-xs"
                onClick={() => setRenameOpen(true)}
              >
                {t('settings.workspace.rename')}
              </Button>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              className="text-xs"
              onClick={() => setCreateOpen(true)}
            >
              {t('settings.workspace.create_new')}
            </Button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-start gap-3">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {t('settings.workspace.no_org')}
          </p>
          <Button
            type="button"
            variant="outline"
            className="text-xs"
            onClick={() => setCreateOpen(true)}
          >
            {t('settings.workspace.create_new')}
          </Button>
        </div>
      )}

      {active ? (
        <RenameOrganizationModal
          open={renameOpen}
          organizationId={active.organizationId}
          initialName={active.organizationName}
          onClose={() => setRenameOpen(false)}
        />
      ) : null}
      <CreateOrganizationModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </Card>
  );
}

function ProductsSection() {
  const { active } = useActiveOrganization();

  return (
    <ProductsSettingsPanel
      organizationId={active?.organizationId}
      isOwner={Boolean(active?.isOwner)}
    />
  );
}

function DangerZoneSection() {
  const { t } = useLocale();
  const { active, clearActive } = useActiveOrganization();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const isOwner = active?.role === 'OWNER';

  return (
    <Card className="space-y-4 border-red-200 dark:border-red-900/60">
      <SectionHeader
        title={t('settings.danger.title')}
        description={t('settings.danger.description')}
      />
      <div className="flex flex-col gap-2">
        <Button
          type="button"
          className="self-start bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-300 disabled:bg-red-200 disabled:text-white dark:bg-red-700 dark:hover:bg-red-600"
          disabled={!active || !isOwner}
          onClick={() => setDeleteOpen(true)}
        >
          {t('settings.danger.delete_org')}
        </Button>
        {!active ? (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {t('settings.workspace.no_org')}
          </p>
        ) : !isOwner ? (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {t('settings.danger.only_owner')}
          </p>
        ) : null}
      </div>
      {active ? (
        <DeleteOrganizationModal
          open={deleteOpen}
          organizationId={active.organizationId}
          organizationName={active.organizationName}
          onClose={() => setDeleteOpen(false)}
          onDeleted={() => clearActive()}
        />
      ) : null}
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-zinc-100 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/60">
      <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
        {label}
      </p>
      <p className="mt-0.5 truncate text-sm font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
        {value}
      </p>
    </div>
  );
}

function FormFooter({
  error,
  successMessage,
  submitLabel,
  submitting,
}: {
  error: string | null;
  successMessage: string | null;
  submitLabel: string;
  submitting: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
      <div className="text-xs">
        {error ? (
          <span className="text-red-700 dark:text-red-300">{error}</span>
        ) : successMessage ? (
          <span className="text-emerald-700 dark:text-emerald-300">{successMessage}</span>
        ) : null}
      </div>
      <Button type="submit" disabled={submitting}>
        {submitLabel}
      </Button>
    </div>
  );
}

function BackIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}
