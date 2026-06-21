import { type FormEvent, useState } from 'react';
import type { OrganizationMember, OrganizationMemberRole } from '@/entities/member/types';
import { useLocale } from '@/features/locale/hooks/use-locale';
import { useCreateMember, useDeleteMember, useMembers } from '@/features/members/hooks/use-members';
import { useActiveOrganization } from '@/features/organizations/hooks/use-active-organization';
import { cn } from '@/shared/lib/cn';
import { formatApiError } from '@/shared/lib/format-api-error';
import { Button } from '@/shared/ui/button';

export function MembersPage() {
  const { t } = useLocale();
  const { active } = useActiveOrganization();
  const isAdmin = active?.isOwner === true;
  const organizationId = active?.organizationId;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('12345678');
  const [role, setRole] = useState<OrganizationMemberRole>('MEMBER');
  const [feedback, setFeedback] = useState<string | null>(null);

  const membersQuery = useMembers(organizationId, isAdmin);
  const createMemberMutation = useCreateMember();
  const deleteMemberMutation = useDeleteMember(organizationId);

  const members = membersQuery.data ?? [];

  function getRoleLabel(memberRole: OrganizationMemberRole) {
    return memberRole === 'OWNER' ? t('members.role_owner') : t('members.role_member');
  }

  async function handleCreateMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!organizationId) {
      setFeedback(t('members.feedback.no_org'));
      return;
    }

    if (!name.trim() || !email.trim() || !password.trim()) {
      setFeedback(t('members.feedback.required'));
      return;
    }

    try {
      setFeedback(null);

      await createMemberMutation.mutateAsync({
        organizationId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      });

      setName('');
      setEmail('');
      setPassword('12345678');
      setRole('MEMBER');
      setFeedback(t('members.feedback.created'));
    } catch (error) {
      setFeedback(formatApiError(error));
    }
  }

  async function handleDeleteMember(member: OrganizationMember) {
    const confirmed = window.confirm(
      t('members.confirm_remove', { name: member.user.name || member.user.email })
    );

    if (!confirmed) return;

    try {
      setFeedback(null);
      await deleteMemberMutation.mutateAsync(member.id);
      setFeedback(t('members.feedback.removed'));
    } catch (error) {
      setFeedback(formatApiError(error));
    }
  }

  if (!isAdmin) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-400">
            {t('members.restricted.section')}
          </p>

          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-100">
            {t('members.restricted.title')}
          </h1>

          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {t('members.restricted.description')}
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      <section className="mb-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-400">
              {t('members.section')}
            </p>

            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-100">
              {t('members.title')}
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
              {t('members.description')}
            </p>
          </div>

          <span className="inline-flex w-fit rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
            {t('members.admin_badge')}
          </span>
        </div>

        {feedback ? (
          <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
            {feedback}
          </div>
        ) : null}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100">
                {t('members.list.title')}
              </h2>

              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                {t('members.list.description')}
              </p>
            </div>

            <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
              {t('members.list.count', { count: members.length })}
            </span>
          </div>

          {membersQuery.isPending ? (
            <div className="mt-6 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center dark:border-zinc-700 dark:bg-zinc-900">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                {t('members.list.loading')}
              </p>
            </div>
          ) : null}

          {membersQuery.isError ? (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
              {t('members.list.error')}
            </div>
          ) : null}

          {!membersQuery.isPending && !membersQuery.isError && members.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center dark:border-zinc-700 dark:bg-zinc-900">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                {t('members.list.empty')}
              </p>

              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {t('members.list.empty_description')}
              </p>
            </div>
          ) : null}

          {members.length > 0 ? (
            <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {members.map((member) => {
                  const isOwner = member.role === 'OWNER';

                  return (
                    <div
                      key={member.id}
                      className="flex flex-col gap-3 bg-white p-4 dark:bg-zinc-950 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-medium text-zinc-950 dark:text-zinc-100">
                            {member.user.name}
                          </p>

                          <span
                            className={cn(
                              'rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide',
                              isOwner
                                ? 'border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200'
                                : 'border-zinc-200 bg-white text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400'
                            )}
                          >
                            {getRoleLabel(member.role)}
                          </span>
                        </div>

                        <p className="mt-1 truncate text-xs text-zinc-500 dark:text-zinc-400">
                          {member.user.email}
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        disabled={isOwner || deleteMemberMutation.isPending}
                        onClick={() => handleDeleteMember(member)}
                        className="h-8 rounded-lg text-xs"
                      >
                        {isOwner ? t('members.actions.protected') : t('members.actions.remove')}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100">
            {t('members.form.title')}
          </h2>

          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {t('members.form.description')}
          </p>

          <form className="mt-6 space-y-3" onSubmit={handleCreateMember}>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-300">
                {t('members.form.name')}
              </label>

              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={t('members.form.name_placeholder')}
                className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-300">
                {t('members.form.email')}
              </label>

              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t('members.form.email_placeholder')}
                type="email"
                className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-300">
                {t('members.form.password')}
              </label>

              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={t('members.form.password_placeholder')}
                type="text"
                className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-300">
                {t('members.form.role')}
              </label>

              <select
                value={role}
                onChange={(event) => setRole(event.target.value === 'OWNER' ? 'OWNER' : 'MEMBER')}
                className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <option value="MEMBER">{t('members.role_member')}</option>
                <option value="OWNER">{t('members.role_owner')}</option>
              </select>
            </div>

            <Button
              type="submit"
              disabled={createMemberMutation.isPending}
              className="h-10 w-full rounded-xl"
            >
              {createMemberMutation.isPending
                ? t('members.form.submitting')
                : t('members.form.submit')}
            </Button>
          </form>

          <p className="mt-4 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
            {t('members.form.hint')}
          </p>
        </div>
      </section>
    </main>
  );
}
