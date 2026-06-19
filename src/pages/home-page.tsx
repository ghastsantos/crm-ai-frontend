import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { useCards } from '@/features/cards/hooks/use-cards';
import { usePipelineKPIs } from '@/features/cards/hooks/use-pipeline-kpis';
import { CardsBoard } from '@/features/cards/ui/cards-board';
import { PipelineKPIsBoard } from '@/features/cards/ui/pipeline-kpis';
import { useLocale } from '@/features/locale/hooks/use-locale';
import {
  useCreatePipelineColumn,
  useDeletePipelineColumn,
  usePipelineColumns,
  useUpdatePipelineColumn,
} from '@/features/pipeline-columns/hooks/use-pipeline-columns';
import { useActiveOrganization } from '@/features/organizations/hooks/use-active-organization';
import { WhatsAppPanel } from '@/features/whatsapp/ui/whatsapp-panel';

export function HomePage() {
  const { t } = useLocale();
  const { data, isPending, isError } = useCurrentUser();
  const { active } = useActiveOrganization();
  const organizationId = active?.organizationId;
  const columnsQuery = usePipelineColumns(organizationId);
  const cardsQuery = useCards(organizationId);
  const createCol = useCreatePipelineColumn();
  const updateCol = useUpdatePipelineColumn();
  const deleteCol = useDeletePipelineColumn();

  const cards = cardsQuery.data ?? [];
  const columns = columnsQuery.data ?? [];
  const kpis = usePipelineKPIs(cards, columns);

  if (isPending) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('app.loading')}</p>;
  }

  if (isError || !data) {
    return <p className="text-sm text-zinc-600 dark:text-zinc-300">{t('home.profile_error')}</p>;
  }

  const boardLoading = Boolean(organizationId) && (columnsQuery.isPending || cardsQuery.isPending);
  const boardError = Boolean(organizationId) && (columnsQuery.isError || cardsQuery.isError);

  return (
    <div className="min-w-0 space-y-10 lg:space-y-12">
      <div className="lg:flex lg:items-end lg:justify-between lg:gap-8">
        <div>
          <h1 className="text-lg font-medium tracking-tight text-zinc-900 dark:text-zinc-100 lg:text-xl">
            {t('home.summary')}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {t('home.greeting')} {data.email}
            {active ? (
              <>
                {' · '}
                <span className="text-zinc-700 dark:text-zinc-200">{active.organizationName}</span>
              </>
            ) : null}
          </p>
        </div>
      </div>

      {organizationId ? (
        <section>
          <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            {t('home.indicators')}
          </h2>
          <PipelineKPIsBoard kpis={kpis} />
        </section>
      ) : null}

      {organizationId && active ? (
        <section>
          <WhatsAppPanel
            organizationId={organizationId}
            organizationName={active.organizationName}
            isOwner={active.isOwner}
          />
        </section>
      ) : null}

      <section className="min-w-0 lg:col-span-2">
        <div className="mb-4 flex flex-col gap-1 lg:mb-6">
          <h2 className="text-sm font-medium uppercase tracking-widest text-zinc-500 dark:text-zinc-500 lg:text-xs">
            {t('home.pipeline.section')}
          </h2>
          <p className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 lg:text-lg">
            {t('home.pipeline.title')}
          </p>
        </div>
        {!organizationId ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('home.pipeline.empty_org')}</p>
        ) : boardLoading ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('home.pipeline.loading')}</p>
        ) : boardError ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-300">{t('home.pipeline.error')}</p>
        ) : (
          <CardsBoard
            columns={columns}
            cards={cards}
            organizationId={organizationId}
            columnActions={{
              onRenameColumn: async (columnId, title) => {
                await updateCol.mutateAsync({
                  id: columnId,
                  organizationId,
                  body: { title },
                });
              },
              onMoveColumn: async (columnId, position) => {
                await updateCol.mutateAsync({
                  id: columnId,
                  organizationId,
                  body: { position },
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
