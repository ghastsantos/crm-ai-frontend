import { useState, type FormEvent } from 'react';
import type { Card } from '@/entities/card/types';
import { getPipelineColumnLabel } from '@/entities/pipeline-column/labels';
import type { PipelineColumn } from '@/entities/pipeline-column/types';
import { useLocale } from '@/features/locale/hooks/use-locale';
import type { LocaleContextValue } from '@/features/locale/model/locale-context';
import { formatApiError } from '@/shared/lib/format-api-error';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Modal } from '@/shared/ui/modal';
import { MoneyInput } from '@/shared/ui/money-input';
import { PhoneInput } from '@/shared/ui/phone-input';
import { useCard, useDeleteCard, useUpdateCard } from '../hooks/use-cards';
import { editCardFormSchema } from '../model/schemas';
import { formatCurrency } from '../lib/format-currency';

const TITLE_MAX = 200;
const NOTES_MAX = 2000;
type DetailsTab = 'details' | 'history';
type Translate = LocaleContextValue['t'];

type CardDetailsModalProps = {
  card: Card;
  columns: PipelineColumn[];
  organizationId: string;
  onClose: () => void;
};

export function CardDetailsModal({
  card,
  columns,
  organizationId,
  onClose,
}: CardDetailsModalProps) {
  const { t, locale } = useLocale();
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<DetailsTab>('details');
  const [title, setTitle] = useState(() => card.title);
  const [value, setValue] = useState(() =>
    card.value != null ? String(card.value).replace('.', ',') : ''
  );
  const [email, setEmail] = useState(() => card.email ?? '');
  const [phone, setPhone] = useState(() => card.phone ?? '');
  const [notes, setNotes] = useState(() => card.notes ?? '');
  const [clientError, setClientError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const updateMutation = useUpdateCard();
  const deleteMutation = useDeleteCard();
  const cardDetailsQuery = useCard(card.id);
  const detailCard = cardDetailsQuery.data ?? card;

  const currentColumn = columns.find((c) => c.id === detailCard.pipelineColumnId);
  const columnTitle = currentColumn
    ? getPipelineColumnLabel(currentColumn, t)
    : t('card.column_pill');

  function handleClose() {
    if (updateMutation.isPending || deleteMutation.isPending) return;
    onClose();
  }

  function handleSave(e: FormEvent) {
    e.preventDefault();
    setClientError(null);
    setFormError(null);

    const parsed = editCardFormSchema.safeParse({
      title,
      email: email.trim() === '' ? undefined : email,
      phone: phone.trim() === '' ? undefined : phone,
      notes: notes.trim() === '' ? undefined : notes,
    });
    if (!parsed.success) {
      const msg = Object.values(parsed.error.flatten().fieldErrors).flat()[0];
      setClientError(msg ?? t('card.validation.check_fields'));
      return;
    }

    const trimmedVal = value.trim();
    let valueBody: number | null;
    if (trimmedVal === '') {
      valueBody = null;
    } else if (/^\d+([.,]\d{1,2})?$/.test(trimmedVal)) {
      const n = Number(trimmedVal.replace(',', '.'));
      if (n <= 0 || n > 1_000_000_000) {
        setClientError(t('card.validation.invalid_value'));
        return;
      }
      valueBody = n;
    } else {
      setClientError(t('card.validation.numeric_value'));
      return;
    }

    updateMutation.mutate(
      {
        cardId: card.id,
        organizationId,
        body: {
          title: parsed.data.title,
          value: valueBody,
          email: parsed.data.email ?? null,
          phone: parsed.data.phone ?? null,
          notes: parsed.data.notes ?? null,
        },
      },
      {
        onSuccess: () => {
          setEditing(false);
        },
        onError: (err: unknown) => {
          setFormError(formatApiError(err));
        },
      }
    );
  }

  function handleDelete() {
    if (!window.confirm(t('card.confirm_delete'))) return;
    deleteMutation.mutate(
      { cardId: card.id, organizationId },
      {
        onSuccess: () => {
          onClose();
        },
        onError: (err: unknown) => {
          setFormError(formatApiError(err));
        },
      }
    );
  }

  return (
    <Modal
      open
      onClose={handleClose}
      className="max-h-[78vh] max-w-lg overflow-hidden"
      title={
        <>
          <h2 className="truncate text-base font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
            {detailCard.title}
          </h2>
          <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">{columnTitle}</p>
        </>
      }
    >
      <div className="max-h-[calc(78vh-92px)] overflow-y-auto pr-1">
        <div className="flex flex-col gap-3">
          {formError ? (
            <p className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
              {formError}
            </p>
          ) : null}

          {editing ? (
            <form onSubmit={handleSave} className="space-y-3">
              {clientError ? (
                <p className="text-xs text-zinc-600 dark:text-zinc-400">{clientError}</p>
              ) : null}
              <div className="space-y-1.5">
                <Label htmlFor="edit-title">{t('card.title')}</Label>
                <Input
                  id="edit-title"
                  value={title}
                  maxLength={TITLE_MAX}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={(e) => setTitle(e.target.value.trim())}
                  aria-invalid={Boolean(clientError)}
                />
                <p className="text-right text-xs text-zinc-400 dark:text-zinc-500">
                  {title.length}/{TITLE_MAX}
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-value">{t('card.value')}</Label>
                <MoneyInput id="edit-value" value={value} onValueChange={setValue} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-email">{t('card.email')}</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={(e) => setEmail(e.target.value.trim().toLowerCase())}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-phone">{t('card.phone')}</Label>
                <PhoneInput id="edit-phone" value={phone} onValueChange={setPhone} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-notes">{t('card.notes')}</Label>
                <textarea
                  id="edit-notes"
                  rows={3}
                  value={notes}
                  maxLength={NOTES_MAX}
                  onChange={(e) => setNotes(e.target.value)}
                  className="flex min-h-[72px] w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus-visible:border-zinc-600 dark:focus-visible:ring-zinc-700"
                />
                <p className="text-right text-xs text-zinc-400 dark:text-zinc-500">
                  {notes.length}/{NOTES_MAX}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? t('common.saving') : t('common.save')}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={updateMutation.isPending}
                  onClick={() => {
                    setEditing(false);
                    setTitle(detailCard.title);
                    setValue(
                      detailCard.value != null ? String(detailCard.value).replace('.', ',') : ''
                    );
                    setEmail(detailCard.email ?? '');
                    setPhone(detailCard.phone ?? '');
                    setNotes(detailCard.notes ?? '');
                    setClientError(null);
                  }}
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          ) : (
            <>
              <div
                className="grid grid-cols-2 rounded-md bg-zinc-100 p-1 text-xs font-medium dark:bg-zinc-800"
                role="tablist"
                aria-label={t('card.details_tabs_aria')}
              >
                <TabButton active={activeTab === 'details'} onClick={() => setActiveTab('details')}>
                  {t('card.details_tab')}
                </TabButton>
                <TabButton active={activeTab === 'history'} onClick={() => setActiveTab('history')}>
                  {t('card.conversation_history_tab')}
                </TabButton>
              </div>

              {activeTab === 'details' ? (
                <>
                  {detailCard.email ? (
                    <Field label={t('card.email')} value={detailCard.email} />
                  ) : null}
                  {detailCard.phone ? (
                    <Field label={t('card.phone')} value={detailCard.phone} />
                  ) : null}
                  <Field label={t('card.value')} value={formatCurrency(detailCard.value)} />
                  <Field
                    label={t('card.created_at')}
                    value={formatUpdatedAt(detailCard.createdAt, locale)}
                  />
                  <Field
                    label={t('card.updated_at')}
                    value={formatUpdatedAt(detailCard.updatedAt, locale)}
                  />
                </>
              ) : (
                <ConversationHistory
                  loading={cardDetailsQuery.isFetching && !cardDetailsQuery.data}
                  messages={detailCard.whatsappConversation?.messages ?? []}
                  locale={locale}
                  t={t}
                />
              )}

              <div className="flex flex-wrap gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-xs"
                  onClick={() => setEditing(true)}
                >
                  {t('common.edit')}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="text-xs text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/40"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? t('common.deleting') : t('common.delete')}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'min-h-8 rounded px-3 py-1.5 text-center transition-colors',
        active
          ? 'bg-white text-zinc-950 shadow-sm dark:bg-zinc-950 dark:text-zinc-50'
          : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
      )}
    >
      {children}
    </button>
  );
}

function ConversationHistory({
  loading,
  messages,
  locale,
  t,
}: {
  loading: boolean;
  messages: NonNullable<Card['whatsappConversation']>['messages'];
  locale: string;
  t: Translate;
}) {
  if (loading) {
    return (
      <div className="rounded-md border border-zinc-100 bg-zinc-50 px-3 py-8 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-400">
        {t('card.conversation_history_loading')}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="rounded-md border border-zinc-100 bg-zinc-50 px-3 py-8 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-400">
        {t('card.conversation_history_empty')}
      </div>
    );
  }

  return (
    <div className="max-h-[320px] space-y-3 overflow-y-auto rounded-md border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950/50">
      {messages.map((message) => {
        const outbound = message.direction === 'OUTBOUND';
        return (
          <div key={message.id} className={cn('flex', outbound ? 'justify-end' : 'justify-start')}>
            <div
              className={cn(
                'max-w-[82%] rounded-lg px-3 py-2 text-sm leading-snug shadow-sm',
                outbound
                  ? 'bg-emerald-700 text-white'
                  : 'border border-zinc-200 bg-white text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100'
              )}
            >
              <p className="whitespace-pre-wrap break-words">
                {formatMessageText(message.text, t)}
              </p>
              <p
                className={cn(
                  'mt-1 text-right text-[10px]',
                  outbound ? 'text-emerald-100' : 'text-zinc-400 dark:text-zinc-500'
                )}
              >
                {outbound ? t('card.conversation_sender_bot') : t('card.conversation_sender_lead')}{' '}
                · {formatMessageTime(message.createdAt, locale)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatMessageText(value: string, t: Translate): string {
  const labels: Record<string, string> = {
    '[imagem recebida]': t('card.message_image_received'),
    '[video recebido]': t('card.message_video_received'),
    '[arquivo recebido]': t('card.message_file_received'),
    '[audio recebido]': t('card.message_audio_received'),
  };

  return labels[value] ?? value;
}

function formatMessageTime(value: string, locale: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-zinc-100 pt-3 dark:border-zinc-800">
      <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
        {label}
      </p>
      <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-900 dark:text-zinc-100">{value}</p>
    </div>
  );
}

function formatUpdatedAt(value: string, locale: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
