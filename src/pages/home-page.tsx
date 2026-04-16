import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { useCards } from '@/features/cards/hooks/use-cards';
import { CardsBoard } from '@/features/cards/ui/cards-board';
import {
  useCreatePipelineColumn,
  useDeletePipelineColumn,
  usePipelineColumns,
  useUpdatePipelineColumn,
} from '@/features/pipeline-columns/hooks/use-pipeline-columns';
import { membershipRoleLabel } from '@/shared/lib/membership-role-label';
import { Card, CardDescription, CardTitle } from '@/shared/ui/card';

export function HomePage() {
  const { data, isPending, isError } = useCurrentUser();
  const organizationId = data?.memberships[0]?.organizationId;
  const columns = usePipelineColumns(organizationId);
  const cards = useCards(organizationId);
  const createCol = useCreatePipelineColumn();
  const updateCol = useUpdatePipelineColumn();
  const deleteCol = useDeletePipelineColumn();

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

  const boardLoading = Boolean(organizationId) && (columns.isPending || cards.isPending);
  const boardError = Boolean(organizationId) && (columns.isError || cards.isError);

  return (
    <div className="space-y-10 lg:space-y-12">
      <div className="lg:flex lg:items-end lg:justify-between lg:gap-8">
        <div>
          <h1 className="text-lg font-medium tracking-tight text-zinc-900 lg:text-xl">Resumo</h1>
          <p className="mt-1 text-sm text-zinc-500">Logado como {data.email}</p>
        </div>
      </div>

      <section className="lg:max-w-md">
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

      <section className="lg:col-span-2">
        <div className="mb-4 flex flex-col gap-1 lg:mb-6">
          <h2 className="text-sm font-medium uppercase tracking-widest text-zinc-500 lg:text-xs">
            Pipeline
          </h2>
          <p className="text-base font-semibold tracking-tight text-zinc-900 lg:text-lg">
            Negócios por etapa
          </p>
        </div>
        {!organizationId ? (
          <p className="text-sm text-zinc-500">
            Vincule-se a uma organização para gerenciar negócios.
          </p>
        ) : boardLoading ? (
          <p className="text-sm text-zinc-500">Carregando pipeline…</p>
        ) : boardError ? (
          <p className="text-sm text-zinc-600">Não foi possível carregar a pipeline.</p>
        ) : (
          <CardsBoard
            columns={columns.data ?? []}
            cards={cards.data ?? []}
            organizationId={organizationId}
            columnActions={{
              onRenameColumn: async (columnId, title) => {
                await updateCol.mutateAsync({
                  id: columnId,
                  organizationId,
                  body: { title },
                });
              },
              onDeleteColumn: async (columnId, moveToColumnId) => {
                await deleteCol.mutateAsync({
                  id: columnId,
                  organizationId,
                  moveToColumnId,
                });
              },
              onAddColumn: async (title) => {
                await createCol.mutateAsync({ organizationId, title });
              },
            }}
          />
        )}
      </section>
    </div>
  );
}
