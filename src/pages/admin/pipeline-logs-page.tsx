import { useMemo, useState } from 'react';
import { useActiveOrganization } from '@/features/organizations/hooks/use-active-organization';
import { usePipelineLogs } from '@/features/pipeline-logs/hooks/use-pipeline-logs';
import type {
  ApiPipelineLogAction,
  PipelineLog as ApiPipelineLog,
} from '@/features/pipeline-logs/api/pipeline-logs-api';
import { Card, CardDescription, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';

type PipelineLogAction =
  | 'CARD_CREATED'
  | 'CARD_MOVED'
  | 'CARD_UPDATED'
  | 'CARD_ARCHIVED'
  | 'CARD_DELETED'
  | 'OWNER_CHANGED'
  | 'COLUMN_CREATED'
  | 'COLUMN_UPDATED'
  | 'COLUMN_DELETED';

type PipelineLog = {
  id: string;
  createdAt: string;
  userName: string;
  userEmail: string;
  organizationName: string;
  cardTitle: string;
  action: PipelineLogAction;
  fromColumn?: string;
  toColumn?: string;
  previousOwner?: string;
  newOwner?: string;
  description: string;
};

const actionLabels: Record<PipelineLogAction, string> = {
  CARD_CREATED: 'Card criado',
  CARD_MOVED: 'Card movido',
  CARD_UPDATED: 'Card atualizado',
  CARD_ARCHIVED: 'Card arquivado',
  CARD_DELETED: 'Card excluído',
  OWNER_CHANGED: 'Responsável alterado',
  COLUMN_CREATED: 'Coluna criada',
  COLUMN_UPDATED: 'Coluna atualizada',
  COLUMN_DELETED: 'Coluna excluída',
};

const actionStyles: Record<PipelineLogAction, string> = {
  CARD_CREATED:
    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300',
  CARD_MOVED:
    'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300',
  CARD_UPDATED:
    'border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  CARD_ARCHIVED:
    'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300',
  CARD_DELETED:
    'border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300',
  OWNER_CHANGED:
    'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300',
  COLUMN_CREATED:
    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300',
  COLUMN_UPDATED:
    'border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  COLUMN_DELETED:
    'border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300',
};

function mapApiAction(action: ApiPipelineLogAction): PipelineLogAction {
  const map: Record<ApiPipelineLogAction, PipelineLogAction> = {
    DEAL_CREATED: 'CARD_CREATED',
    DEAL_MOVED: 'CARD_MOVED',
    DEAL_UPDATED: 'CARD_UPDATED',
    DEAL_ARCHIVED: 'CARD_ARCHIVED',
    DEAL_DELETED: 'CARD_DELETED',
    OWNER_CHANGED: 'OWNER_CHANGED',
    COLUMN_CREATED: 'COLUMN_CREATED',
    COLUMN_UPDATED: 'COLUMN_UPDATED',
    COLUMN_DELETED: 'COLUMN_DELETED',
  };

  return map[action];
}

function mapApiLog(log: ApiPipelineLog): PipelineLog {
  return {
    id: log.id,
    createdAt: log.createdAt,
    userName: log.user?.name ?? 'Usuário não identificado',
    userEmail: log.user?.email ?? 'Sem e-mail',
    organizationName: log.organization?.name ?? 'Organização não identificada',
    cardTitle: log.deal?.title ?? log.previousValue ?? 'Negociação não identificada',
    action: mapApiAction(log.action),
    fromColumn: log.fromColumnName ?? undefined,
    toColumn: log.toColumnName ?? undefined,
    description: log.description,
  };
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function getActionDetails(log: PipelineLog) {
  if (log.action === 'CARD_MOVED') {
    return `${log.fromColumn ?? 'Sem origem'} → ${log.toColumn ?? 'Sem destino'}`;
  }

  if (log.action === 'OWNER_CHANGED') {
    return `${log.previousOwner ?? 'Sem responsável'} → ${log.newOwner ?? 'Sem responsável'}`;
  }

  if (log.action === 'CARD_CREATED') {
    return `Criado em ${log.toColumn ?? 'Pipeline'}`;
  }

  if (log.action === 'CARD_ARCHIVED') {
    return `Arquivado a partir de ${log.fromColumn ?? 'Pipeline'}`;
  }

  if (log.action === 'CARD_DELETED') {
    return `Excluído a partir de ${log.fromColumn ?? 'Pipeline'}`;
  }

  if (log.action === 'COLUMN_CREATED') {
    return `Coluna criada: ${log.toColumn ?? 'Sem nome'}`;
  }

  if (log.action === 'COLUMN_UPDATED') {
    return 'Coluna atualizada';
  }

  if (log.action === 'COLUMN_DELETED') {
    return `Coluna excluída: ${log.fromColumn ?? 'Sem nome'}`;
  }

  return log.description;
}

function exportLogsToCsv(logs: PipelineLog[]) {
  const headers = [
    'Data e hora',
    'Usuario',
    'Email',
    'Negociacao',
    'Acao',
    'Detalhes',
    'Organizacao',
    'Descricao',
  ];

  const rows = logs.map((log) => [
    formatDateTime(log.createdAt),
    log.userName,
    log.userEmail,
    log.cardTitle,
    actionLabels[log.action],
    getActionDetails(log),
    log.organizationName,
    log.description,
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(';'))
    .join('\n');

  const blob = new Blob([`\uFEFF${csvContent}`], {
    type: 'text/csv;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `logs-pipeline-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export function PipelineLogsPage() {
  const { active } = useActiveOrganization();
  const organizationId = active?.organizationId;

  const [search, setSearch] = useState('');
  const [action, setAction] = useState<'ALL' | PipelineLogAction>('ALL');

  const logsQuery = usePipelineLogs({
    organizationId,
    limit: 200,
  });

  const logs = useMemo(() => {
    return (logsQuery.data ?? []).map(mapApiLog);
  }, [logsQuery.data]);

  const filteredLogs = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return logs.filter((log) => {
      const matchesAction = action === 'ALL' || log.action === action;

      const matchesSearch =
        normalizedSearch === '' ||
        log.userName.toLowerCase().includes(normalizedSearch) ||
        log.userEmail.toLowerCase().includes(normalizedSearch) ||
        log.cardTitle.toLowerCase().includes(normalizedSearch) ||
        log.organizationName.toLowerCase().includes(normalizedSearch) ||
        log.description.toLowerCase().includes(normalizedSearch) ||
        actionLabels[log.action].toLowerCase().includes(normalizedSearch);

      return matchesAction && matchesSearch;
    });
  }, [logs, search, action]);

  const totalMovements = logs.filter((log) => log.action === 'CARD_MOVED').length;
  const totalCreated = logs.filter((log) => log.action === 'CARD_CREATED').length;
  const totalUpdated = logs.filter((log) => log.action === 'CARD_UPDATED').length;
  const totalArchived = logs.filter((log) => log.action === 'CARD_ARCHIVED').length;
  const totalDeleted = logs.filter((log) => log.action === 'CARD_DELETED').length;

  function handleClearFilters() {
    setSearch('');
    setAction('ALL');
  }

  return (
    <div className="min-w-0 space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-emerald-500 dark:text-emerald-400">
            Administração
          </p>

          <h1 className="mt-2 text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Histórico da Pipeline
          </h1>

          <p className="mt-1 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
            Acompanhe todas as movimentações realizadas nas negociações, incluindo criação, edição,
            mudança de etapa, alteração de responsável, arquivamento e exclusão.
          </p>

          <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
            Última atualização:{' '}
            {logsQuery.dataUpdatedAt
              ? formatDateTime(new Date(logsQuery.dataUpdatedAt).toISOString())
              : 'Ainda não atualizado'}
          </p>

          {logsQuery.isError ? (
            <p className="mt-2 text-xs text-red-500 dark:text-red-300">
              Erro ao buscar logs.
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => void logsQuery.refetch()}
            disabled={logsQuery.isFetching || !organizationId}
          >
            {logsQuery.isFetching ? 'Atualizando...' : 'Atualizar logs'}
          </Button>

          <Button
            variant="outline"
            onClick={() => exportLogsToCsv(filteredLogs)}
            disabled={filteredLogs.length === 0}
          >
            Exportar logs
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Card>
          <CardTitle>{logs.length}</CardTitle>
          <CardDescription>Total de registros</CardDescription>
        </Card>

        <Card>
          <CardTitle>{totalMovements}</CardTitle>
          <CardDescription>Movimentações</CardDescription>
        </Card>

        <Card>
          <CardTitle>{totalCreated}</CardTitle>
          <CardDescription>Cards criados</CardDescription>
        </Card>

        <Card>
          <CardTitle>{totalUpdated}</CardTitle>
          <CardDescription>Atualizações</CardDescription>
        </Card>

        <Card>
          <CardTitle>{totalArchived + totalDeleted}</CardTitle>
          <CardDescription>Arquivados ou excluídos</CardDescription>
        </Card>
      </div>

      <Card className="space-y-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <CardTitle>Logs de negociações</CardTitle>
            <CardDescription>
              Registros ordenados pelas movimentações mais recentes da pipeline.
            </CardDescription>
          </div>

          <div className="grid gap-3 sm:grid-cols-[minmax(220px,340px)_190px_auto]">
            <div className="space-y-1.5">
              <Label htmlFor="search">Buscar</Label>
              <Input
                id="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Usuário, lead, ação ou organização"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="action">Tipo de ação</Label>
              <select
                id="action"
                value={action}
                onChange={(event) => setAction(event.target.value as 'ALL' | PipelineLogAction)}
                className="flex h-9 w-full rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm text-zinc-900 shadow-sm outline-none transition-colors focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus-visible:border-zinc-600 dark:focus-visible:ring-zinc-700"
              >
                <option value="ALL">Todas</option>
                <option value="CARD_CREATED">Card criado</option>
                <option value="CARD_MOVED">Card movido</option>
                <option value="CARD_UPDATED">Card atualizado</option>
                <option value="OWNER_CHANGED">Responsável alterado</option>
                <option value="CARD_ARCHIVED">Card arquivado</option>
                <option value="CARD_DELETED">Card excluído</option>
                <option value="COLUMN_CREATED">Coluna criada</option>
                <option value="COLUMN_UPDATED">Coluna atualizada</option>
                <option value="COLUMN_DELETED">Coluna excluída</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button variant="ghost" onClick={handleClearFilters}>
                Limpar filtros
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-500 dark:text-zinc-500">
              {filteredLogs.length} registro(s) encontrado(s)
            </p>

            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              Exporta apenas os registros filtrados
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-left text-sm">
              <thead className="bg-zinc-50 text-xs uppercase tracking-widest text-zinc-500 dark:bg-zinc-950/60 dark:text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Data e hora</th>
                  <th className="px-4 py-3 font-medium">Usuário</th>
                  <th className="px-4 py-3 font-medium">Negociação</th>
                  <th className="px-4 py-3 font-medium">Ação</th>
                  <th className="px-4 py-3 font-medium">Detalhes</th>
                  <th className="px-4 py-3 font-medium">Organização</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {logsQuery.isLoading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="bg-white px-4 py-12 text-center text-sm text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400"
                    >
                      Carregando logs...
                    </td>
                  </tr>
                ) : filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="bg-white transition-colors hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800/70"
                    >
                      <td className="whitespace-nowrap px-4 py-4 text-zinc-600 dark:text-zinc-300">
                        {formatDateTime(log.createdAt)}
                      </td>

                      <td className="px-4 py-4">
                        <div className="font-medium text-zinc-900 dark:text-zinc-100">
                          {log.userName}
                        </div>

                        <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-500">
                          {log.userEmail}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="font-medium text-zinc-900 dark:text-zinc-100">
                          {log.cardTitle}
                        </div>

                        <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-500">
                          {log.description}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${actionStyles[log.action]}`}
                        >
                          {actionLabels[log.action]}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-zinc-600 dark:text-zinc-300">
                        {getActionDetails(log)}
                      </td>

                      <td className="px-4 py-4 text-zinc-600 dark:text-zinc-300">
                        {log.organizationName}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="bg-white px-4 py-12 text-center text-sm text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400"
                    >
                      Nenhum log encontrado com os filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}