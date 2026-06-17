import { useState, type FormEvent } from 'react';
import type { Card } from '@/entities/card/types';
import type { PipelineColumn } from '@/entities/pipeline-column/types';
import { useLocale } from '@/features/locale/hooks/use-locale';
import { formatApiError } from '@/shared/lib/format-api-error';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Modal } from '@/shared/ui/modal';
import { MoneyInput } from '@/shared/ui/money-input';
import { PhoneInput } from '@/shared/ui/phone-input';
import { useDeleteCard, useUpdateCard } from '../hooks/use-cards';
import { editCardFormSchema } from '../model/schemas';
import { formatCurrency } from '../lib/format-currency';

const TITLE_MAX = 200;
const NOTES_MAX = 2000;

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

  const columnTitle =
    columns.find((c) => c.id === card.pipelineColumnId)?.title ?? t('card.column_pill');

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
      setClientError(msg ?? 'Verifique os campos');
      return;
    }

    const trimmedVal = value.trim();
    let valueBody: number | null;
    if (trimmedVal === '') {
      valueBody = null;
    } else if (/^\d+([.,]\d{1,2})?$/.test(trimmedVal)) {
      const n = Number(trimmedVal.replace(',', '.'));
      if (n <= 0 || n > 1_000_000_000) {
        setClientError('Valor inválido');
        return;
      }
      valueBody = n;
    } else {
      setClientError('Informe um valor numérico válido');
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
      title={
        <>
          <h2 className="truncate text-base font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
            {card.title}
          </h2>
          <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">{columnTitle}</p>
        </>
      }
    >
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
                  setTitle(card.title);
                  setValue(card.value != null ? String(card.value).replace('.', ',') : '');
                  setEmail(card.email ?? '');
                  setPhone(card.phone ?? '');
                  setNotes(card.notes ?? '');
                  setClientError(null);
                }}
              >
                {t('common.cancel')}
              </Button>
            </div>
          </form>
        ) : (
          <>
            {card.email ? <Field label={t('card.email')} value={card.email} /> : null}
            {card.phone ? <Field label={t('card.phone')} value={card.phone} /> : null}
            <Field label={t('card.value')} value={formatCurrency(card.value)} />
            {card.notes ? <Field label={t('card.notes')} value={card.notes} /> : null}
            <Field label={t('card.created_at')} value={formatUpdatedAt(card.createdAt, locale)} />
            <Field label={t('card.updated_at')} value={formatUpdatedAt(card.updatedAt, locale)} />
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
    </Modal>
  );
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
