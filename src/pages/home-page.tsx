import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { membershipRoleLabel } from '@/shared/lib/membership-role-label';
import { Card, CardDescription, CardTitle } from '@/shared/ui/card';

export function HomePage() {
  const { data, isPending, isError } = useCurrentUser();

  if (isPending) {
    return <p className="text-sm text-zinc-500">Carregando…</p>;
  }

  if (isError || !data) {
    return (
      <p className="text-sm text-zinc-600">
        Não foi possível carregar o perfil. Atualize a página ou faça login novamente.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-medium tracking-tight text-zinc-900">Resumo</h1>
        <p className="mt-1 text-sm text-zinc-500">Logado como {data.email}</p>
      </div>

      <section>
        <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-zinc-400">
          Organizações
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {data.memberships.length === 0 ? (
            <p className="text-sm text-zinc-500">Nenhuma organização vinculada.</p>
          ) : (
            data.memberships.map((m) => (
              <Card key={m.id}>
                <CardTitle className="text-sm">{m.organizationName}</CardTitle>
                <CardDescription>{membershipRoleLabel(m.role)}</CardDescription>
              </Card>
            ))
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-zinc-400">
          Pipeline
        </h2>
        <Card className="border-dashed">
          <CardTitle className="text-sm">Dados do CRM</CardTitle>
          <CardDescription>
            Contatos e negócios aparecerão aqui quando a API estiver disponível.
          </CardDescription>
        </Card>
      </section>
    </div>
  );
}
