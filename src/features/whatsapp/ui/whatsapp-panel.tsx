import type { WhatsAppConnectionStatus, WhatsAppStage } from '@/features/whatsapp/api/whatsapp-api';
import {
  useConnectWhatsAppIntegration,
  useSetupWhatsAppIntegration,
  useWhatsAppConversations,
  useWhatsAppIntegration,
} from '@/features/whatsapp/hooks/use-whatsapp';
import { formatApiError } from '@/shared/lib/format-api-error';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';

type WhatsAppPanelProps = {
  organizationId: string;
  organizationName: string;
  isOwner: boolean;
};

const statusLabel: Record<WhatsAppConnectionStatus, string> = {
  NOT_CONFIGURED: 'Não configurado',
  CONNECTING: 'Aguardando conexão',
  CONNECTED: 'Conectado',
  DISCONNECTED: 'Desconectado',
};

const stageLabel: Record<WhatsAppStage, string> = {
  LEAD: 'Lead',
  QUALIFICACAO: 'Qualificação',
  EM_NEGOCIACAO: 'Em negociação',
  FECHAMENTO: 'Fechamento',
  NAO_FECHOU: 'Não fechou',
};

function qrSource(value: string | null): string | null {
  if (!value) return null;
  return value.startsWith('data:image') ? value : `data:image/png;base64,${value}`;
}

export function WhatsAppPanel({ organizationId, organizationName, isOwner }: WhatsAppPanelProps) {
  const integrationQuery = useWhatsAppIntegration();
  const conversationsQuery = useWhatsAppConversations(organizationId);
  const setupMutation = useSetupWhatsAppIntegration();
  const connectMutation = useConnectWhatsAppIntegration();

  const integration = integrationQuery.data;
  const linkedToThisOrg = integration?.organizationId === organizationId;
  const linkedToAnotherOrg = Boolean(integration?.organizationId && !linkedToThisOrg);
  const connectedToThisOrg = linkedToThisOrg && integration?.status === 'CONNECTED';
  const showSetupButton = isOwner && !linkedToThisOrg && !linkedToAnotherOrg;
  const showConnectButton = isOwner && linkedToThisOrg && !connectedToThisOrg;
  const showQrBox = showConnectButton;
  const canSetup = showSetupButton && !setupMutation.isPending;
  const canConnect = showConnectButton && !connectMutation.isPending;
  const qr = qrSource(integration?.qrCode ?? null);
  const actionError = setupMutation.error ?? connectMutation.error;

  return (
    <Card className="space-y-4 border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/60 dark:bg-emerald-950/20">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-medium uppercase tracking-widest text-emerald-700 dark:text-emerald-300">
            WhatsApp conectado ao CRM
          </p>
          <h2 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Atendimento automático para {organizationName}
          </h2>
          <p className="max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
            O bot recebe mensagens reais pelo WhatsApp Web, responde o cliente e atualiza cards no
            pipeline.
          </p>
        </div>
        <StatusPill status={integration?.status ?? 'NOT_CONFIGURED'} />
      </div>

      {actionError ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
          {formatApiError(actionError)}
        </p>
      ) : null}

      <div className={showQrBox ? 'grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]' : 'grid gap-4'}>
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Info label="Organização" value={integration?.organization?.name ?? 'Não vinculada'} />
            <Info label="Número" value={integration?.connectedPhone ?? 'Aguardando'} />
          </div>

          {showSetupButton || showConnectButton ? (
            <div className="flex flex-wrap gap-2">
              {showSetupButton ? (
                <Button
                  type="button"
                  disabled={!canSetup}
                  onClick={() => setupMutation.mutate(organizationId)}
                >
                  {setupMutation.isPending ? 'Configurando...' : 'Vincular esta organização'}
                </Button>
              ) : null}
              {showConnectButton ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={!canConnect}
                  onClick={() => connectMutation.mutate()}
                >
                  {connectMutation.isPending ? 'Gerando conexão...' : 'Gerar QR code'}
                </Button>
              ) : null}
            </div>
          ) : null}

          {!isOwner ? (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Apenas administradores podem conectar ou trocar o número do WhatsApp.
            </p>
          ) : linkedToAnotherOrg ? (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Já existe um número de WhatsApp vinculado a outra organização.
            </p>
          ) : connectedToThisOrg ? (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Esta organização já está pronta para receber mensagens do WhatsApp.
            </p>
          ) : null}
        </div>

        {showQrBox ? (
          <div className="rounded-md border border-emerald-200 bg-white p-3 dark:border-emerald-900/60 dark:bg-zinc-950">
            {qr ? (
              <img
                src={qr}
                alt="QR code para conectar o WhatsApp"
                className="mx-auto aspect-square w-full max-w-[180px] rounded-md border border-zinc-100 object-contain dark:border-zinc-800"
              />
            ) : (
              <div className="flex aspect-square w-full items-center justify-center rounded-md border border-dashed border-zinc-200 px-4 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                Gere o QR code e escaneie com o WhatsApp do atendimento.
              </div>
            )}
            {integration?.pairingCode ? (
              <p className="mt-2 text-center text-xs font-medium text-zinc-700 dark:text-zinc-200">
                Código: {integration.pairingCode}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="border-t border-emerald-100 pt-4 dark:border-emerald-900/50">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-xs font-medium uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Conversas recentes
          </h3>
          {conversationsQuery.isFetching ? (
            <span className="text-xs text-zinc-400">Atualizando...</span>
          ) : null}
        </div>
        {conversationsQuery.data?.length ? (
          <div className="grid gap-2">
            {conversationsQuery.data.slice(0, 4).map((conversation) => (
              <div
                key={conversation.id}
                className="rounded-md border border-zinc-100 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {conversation.contactName ?? conversation.phone}
                  </p>
                  {conversation.stage && conversation.stage !== 'LEAD' ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                      {stageLabel[conversation.stage]}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
                  {conversation.summary ?? conversation.messages[0]?.text ?? 'Sem resumo ainda.'}
                </p>
                {conversation.deal ? (
                  <p className="mt-1 text-xs text-zinc-700 dark:text-zinc-300">
                    Card: {conversation.deal.title}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Nenhuma conversa recebida pela integração ainda.
          </p>
        )}
      </div>
    </Card>
  );
}

function StatusPill({ status }: { status: WhatsAppConnectionStatus }) {
  const connected = status === 'CONNECTED';
  return (
    <span
      className={
        connected
          ? 'inline-flex items-center rounded-full bg-emerald-600 px-3 py-1 text-xs font-medium text-white'
          : 'inline-flex items-center rounded-full bg-zinc-200 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200'
      }
    >
      {statusLabel[status]}
    </span>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-emerald-100 bg-white px-3 py-2 dark:border-emerald-900/50 dark:bg-zinc-950">
      <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
        {label}
      </p>
      <p className="mt-0.5 truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
        {value}
      </p>
    </div>
  );
}
