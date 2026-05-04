import { useState, type FormEvent } from 'react';
import { useLocale } from '@/features/locale/hooks/use-locale';
import { formatApiError } from '@/shared/lib/format-api-error';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Modal } from '@/shared/ui/modal';
import { MoneyInput } from '@/shared/ui/money-input';
import { PhoneInput } from '@/shared/ui/phone-input';
import { useCreateCard } from '../hooks/use-cards';
import { createCardFormSchema } from '../model/schemas';

type CreateCardModalProps = {
  open: boolean;
  onClose: () => void;
  organizationId: string;
  defaultPipelineColumnId: string | null;
  defaultColumnTitle?: string | null;
};

type FormState = {
  title: string;
  pipelineColumnId: string;
  value: string;
  email: string;
  phone: string;
  notes: string;
};

const emptyForm = (columnId: string): FormState => ({
  title: '',
  pipelineColumnId: columnId,
  value: '',
  email: '',
  phone: '',
  notes: '',
});

const textareaClassName = cn(
  'flex min-h-[88px] w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition-colors',
  'placeholder:text-zinc-400',
  'focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-200',
  'disabled:cursor-not-allowed disabled:opacity-50',
  'dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500',
  'dark:focus-visible:border-zinc-600 dark:focus-visible:ring-zinc-700'
);

const TITLE_MAX = 200;
const NOTES_MAX = 500;

export function CreateCardModal({
  open,
  onClose,
  organizationId,
  defaultPipelineColumnId,
  defaultColumnTitle,
}: CreateCardModalProps) {
  const { t } = useLocale();
  const columnId = defaultPipelineColumnId ?? '';
  const [values, setValues] = useState<FormState>(() => emptyForm(columnId));
  const [clientErrors, setClientErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const mutation = useCreateCard();

  function resetForm() {
    setValues(emptyForm(defaultPipelineColumnId ?? ''));
    setClientErrors({});
    setFormError(null);
  }

  function handleClose() {
    if (mutation.isPending) return;
    resetForm();
    onClose();
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setClientErrors({});

    const parsed = createCardFormSchema.safeParse(values);
    if (!parsed.success) {
      const fe = parsed.error.flatten().fieldErrors;
      setClientErrors({
        title: fe.title?.[0],
        pipelineColumnId: fe.pipelineColumnId?.[0],
        value: fe.value?.[0],
        email: fe.email?.[0],
        phone: fe.phone?.[0],
        notes: fe.notes?.[0],
      });
      return;
    }

    mutation.mutate(
      {
        organizationId,
        title: parsed.data.title,
        pipelineColumnId: parsed.data.pipelineColumnId,
        value: parsed.data.value ?? null,
        email: parsed.data.email ?? null,
        phone: parsed.data.phone ?? null,
        notes: parsed.data.notes ?? null,
      },
      {
        onSuccess: () => {
          resetForm();
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
      open={open}
      onClose={handleClose}
      title={
        <>
          <h2 className="truncate text-base font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
            {t('card.new')}
          </h2>
          <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
            {t('card.subtitle')}
          </p>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError ? (
          <p className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
            {formError}
          </p>
        ) : null}

        {defaultColumnTitle ? (
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            {t('card.column_label')}{' '}
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {defaultColumnTitle}
            </span>
          </p>
        ) : null}

        <div className="space-y-1.5">
          <Label htmlFor="card-title">{t('card.title')}</Label>
          <Input
            id="card-title"
            name="title"
            value={values.title}
            maxLength={TITLE_MAX}
            onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
            onBlur={(e) => setValues((v) => ({ ...v, title: e.target.value.trim() }))}
            aria-invalid={Boolean(clientErrors.title)}
          />
          <FieldFooter error={clientErrors.title} hint={`${values.title.length}/${TITLE_MAX}`} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="card-email">{t('card.email')}</Label>
            <Input
              id="card-email"
              name="email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
              onBlur={(e) =>
                setValues((v) => ({ ...v, email: e.target.value.trim().toLowerCase() }))
              }
              aria-invalid={Boolean(clientErrors.email)}
            />
            {clientErrors.email ? (
              <p className="text-xs text-zinc-600 dark:text-zinc-400">{clientErrors.email}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="card-phone">{t('card.phone')}</Label>
            <PhoneInput
              id="card-phone"
              name="phone"
              value={values.phone}
              onValueChange={(next) => setValues((v) => ({ ...v, phone: next }))}
              aria-invalid={Boolean(clientErrors.phone)}
            />
            {clientErrors.phone ? (
              <p className="text-xs text-zinc-600 dark:text-zinc-400">{clientErrors.phone}</p>
            ) : null}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="card-value">{t('card.value')}</Label>
          <MoneyInput
            id="card-value"
            name="value"
            value={values.value}
            onValueChange={(next) => setValues((v) => ({ ...v, value: next }))}
            aria-invalid={Boolean(clientErrors.value)}
          />
          {clientErrors.value ? (
            <p className="text-xs text-zinc-600 dark:text-zinc-400">{clientErrors.value}</p>
          ) : (
            <p className="text-xs text-zinc-400 dark:text-zinc-500">{t('card.value_hint')}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="card-notes">{t('card.notes')}</Label>
          <textarea
            id="card-notes"
            name="notes"
            rows={3}
            value={values.notes}
            maxLength={NOTES_MAX}
            onChange={(e) => setValues((v) => ({ ...v, notes: e.target.value }))}
            aria-invalid={Boolean(clientErrors.notes)}
            className={textareaClassName}
          />
          <FieldFooter error={clientErrors.notes} hint={`${values.notes.length}/${NOTES_MAX}`} />
        </div>

        <input type="hidden" name="pipelineColumnId" value={values.pipelineColumnId} />

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={mutation.isPending}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={mutation.isPending || !values.pipelineColumnId}>
            {mutation.isPending ? t('common.creating') : t('card.create')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function FieldFooter({ error, hint }: { error?: string; hint: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-zinc-600 dark:text-zinc-400">{error ?? ' '}</span>
      <span className="text-zinc-400 dark:text-zinc-500">{hint}</span>
    </div>
  );
}
