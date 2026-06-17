import { useState, type FormEvent } from 'react';
import type { OrganizationMember, OrganizationMemberRole } from '@/entities/member/types';
import { useCreateMember, useDeleteMember, useMembers } from '@/features/members/hooks/use-members';
import { useActiveOrganization } from '@/features/organizations/hooks/use-active-organization';
import { cn } from '@/shared/lib/cn';
import { formatApiError } from '@/shared/lib/format-api-error';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

const roleLabel: Record<OrganizationMemberRole, string> = {
  OWNER: 'Admin',
  MEMBER: 'Membro',
};

export function MembersPage() {
  const { active } = useActiveOrganization();
  const organizationId = active?.organizationId;
  const isOwner = active?.isOwner === true;
  const membersQuery = useMembers(organizationId, isOwner);

  if (!isOwner) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <Card className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Acesso restrito
          </p>
          <h1 className="text-lg font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
            Area exclusiva para administradores
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Apenas admins da organizacao atual podem gerenciar membros.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              Administracao
            </p>
            <h1 className="mt-1 text-lg font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
              Membros da organizacao
            </h1>
          </div>
          <span className="rounded-md border border-zinc-200 px-2 py-1 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            {membersQuery.data?.length ?? 0} usuario(s)
          </span>
        </div>

        {membersQuery.isLoading ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Carregando membros...</p>
        ) : membersQuery.isError ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
            Nao foi possivel carregar os membros.
          </p>
        ) : membersQuery.data?.length ? (
          <div className="divide-y divide-zinc-100 overflow-hidden rounded-md border border-zinc-100 dark:divide-zinc-800 dark:border-zinc-800">
            {membersQuery.data.map((member) => (
              <MemberRow key={member.id} member={member} organizationId={organizationId} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Nenhum membro cadastrado nesta organizacao.
          </p>
        )}
      </Card>

      <CreateMemberPanel organizationId={organizationId} />
    </div>
  );
}

function MemberRow({
  member,
  organizationId,
}: {
  member: OrganizationMember;
  organizationId: string | undefined;
}) {
  const deleteMutation = useDeleteMember(organizationId);
  const isOwner = member.role === 'OWNER';

  function handleDelete() {
    if (!window.confirm(`Remover ${member.user.name || member.user.email} da organizacao?`)) return;
    deleteMutation.mutate(member.id);
  }

  return (
    <div className="flex flex-col gap-3 bg-white px-3 py-3 dark:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {member.user.name}
          </p>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[11px] font-medium',
              isOwner
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'
            )}
          >
            {roleLabel[member.role]}
          </span>
        </div>
        <p className="mt-1 truncate text-xs text-zinc-500 dark:text-zinc-400">
          {member.user.email}
        </p>
      </div>

      <Button
        type="button"
        variant="ghost"
        className="self-start text-xs text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/40 sm:self-center"
        disabled={isOwner || deleteMutation.isPending}
        onClick={handleDelete}
      >
        {isOwner ? 'Protegido' : deleteMutation.isPending ? 'Removendo...' : 'Remover'}
      </Button>
    </div>
  );
}

function CreateMemberPanel({ organizationId }: { organizationId: string | undefined }) {
  const createMutation = useCreateMember();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<OrganizationMemberRole>('MEMBER');
  const [error, setError] = useState<string | null>(null);
  const [createdEmail, setCreatedEmail] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!organizationId) return;

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      setError('Informe o nome.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Informe um e-mail valido.');
      return;
    }
    if (password.length < 8) {
      setError('A senha precisa ter pelo menos 8 caracteres.');
      return;
    }

    setError(null);
    createMutation.mutate(
      {
        organizationId,
        name: cleanName,
        email: cleanEmail,
        password,
        role,
      },
      {
        onSuccess: () => {
          setCreatedEmail(cleanEmail);
          setName('');
          setEmail('');
          setPassword('');
          setRole('MEMBER');
        },
        onError: (err: unknown) => {
          setCreatedEmail(null);
          setError(formatApiError(err));
        },
      }
    );
  }

  return (
    <Card className="space-y-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          Novo acesso
        </p>
        <h2 className="mt-1 text-base font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
          Cadastrar usuario
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="member-name">Nome</Label>
          <Input
            id="member-name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setCreatedEmail(null);
            }}
            maxLength={200}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="member-email">E-mail</Label>
          <Input
            id="member-email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setCreatedEmail(null);
            }}
            maxLength={320}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="member-password">Senha temporaria</Label>
          <Input
            id="member-password"
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setCreatedEmail(null);
            }}
            maxLength={128}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="member-role">Perfil</Label>
          <select
            id="member-role"
            value={role}
            onChange={(event) =>
              setRole(event.target.value === 'OWNER' ? 'OWNER' : 'MEMBER')
            }
            className="flex h-9 w-full rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm text-zinc-900 shadow-sm outline-none transition-colors focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus-visible:border-zinc-600 dark:focus-visible:ring-zinc-700"
          >
            <option value="MEMBER">Membro</option>
            <option value="OWNER">Admin</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <p className="text-xs">
            {error ? (
              <span className="text-red-700 dark:text-red-300">{error}</span>
            ) : createdEmail ? (
              <span className="text-emerald-700 dark:text-emerald-300">
                Usuario {createdEmail} criado.
              </span>
            ) : null}
          </p>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Criando...' : 'Criar usuario'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
