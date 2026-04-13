import { useState, type FormEvent } from 'react';
import { CARD_STAGES } from '@/entities/card/types';
import { formatApiError } from '@/shared/lib/format-api-error';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Modal } from '@/shared/ui/modal';
import { useCreateCard } from '../hooks/use-cards';
import { cardStageLabel } from '../lib/card-stage-label';
import { createCardFormSchema } from '../model/schemas';
import type { CardStage } from '@/entities/card/types';

type CreateCardModalProps = {
  open: boolean;
  onClose: () => void;
  organizationId: string;
};

type FormState = {
  title: string;
  companyName: string;
  contactName: string;
  value: string;
  email: string;
  phone: string;
  notes: string;
  stage: CardStage;
};

const initialState: FormState = {
  title: '',
  companyName: '',
  contactName: '',
  value: '',
  email: '',
  phone: '',
  notes: '',
  stage: 'LEAD_CAPTADO',
};

const selectClassName = cn(
  'flex h-9 w-full rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm text-zinc-900 shadow-sm outline-none transition-colors',
  'focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-200',
  'disabled:cursor-not-allowed disabled:opacity-50'
);

const textareaClassName = cn(
  'flex min-h-[88px] w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition-colors',
  'placeholder:text-zinc-400',
  'focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-200',
  'disabled:cursor-not-allowed disabled:opacity-50'
);

export function CreateCardModal({ open, onClose, organizationId }: CreateCardModalProps) {
  const [values, setValues] = useState<FormState>(initialState);
  const [clientErrors, setClientErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const mutation = useCreateCard();

  function resetForm() {
    setValues(initialState);
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
        companyName: fe.companyName?.[0],
        contactName: fe.contactName?.[0],
        value: fe.value?.[0],
        email: fe.email?.[0],
        phone: fe.phone?.[0],
        notes: fe.notes?.[0],
        stage: fe.stage?.[0],
      });
      return;
    }

    mutation.mutate(
      {
        organizationId,
        title: parsed.data.title,
        stage: parsed.data.stage,
        value: parsed.data.value ?? null,
        companyName: parsed.data.companyName ?? null,
        contactName: parsed.data.contactName ?? null,
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
          <h2 className="truncate text-base font-medium tracking-tight text-zinc-900">
            Novo negócio
          </h2>
          <p className="mt-0.5 truncate text-xs text-zinc-500">Preencha os dados do card</p>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError ? (
          <p className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-700">
            {formError}
          </p>
        ) : null}

        <div className="space-y-1.5">
          <Label htmlFor="card-title">Título</Label>
          <Input
            id="card-title"
            name="title"
            value={values.title}
            onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
            aria-invalid={Boolean(clientErrors.title)}
          />
          {clientErrors.title ? (
            <p className="text-xs text-zinc-600">{clientErrors.title}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="card-company">Empresa</Label>
          <Input
            id="card-company"
            name="companyName"
            autoComplete="organization"
            value={values.companyName}
            onChange={(e) => setValues((v) => ({ ...v, companyName: e.target.value }))}
            aria-invalid={Boolean(clientErrors.companyName)}
          />
          {clientErrors.companyName ? (
            <p className="text-xs text-zinc-600">{clientErrors.companyName}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="card-contact">Contato</Label>
          <Input
            id="card-contact"
            name="contactName"
            autoComplete="name"
            value={values.contactName}
            onChange={(e) => setValues((v) => ({ ...v, contactName: e.target.value }))}
            aria-invalid={Boolean(clientErrors.contactName)}
          />
          {clientErrors.contactName ? (
            <p className="text-xs text-zinc-600">{clientErrors.contactName}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="card-email">E-mail</Label>
            <Input
              id="card-email"
              name="email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
              aria-invalid={Boolean(clientErrors.email)}
            />
            {clientErrors.email ? (
              <p className="text-xs text-zinc-600">{clientErrors.email}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="card-phone">Telefone</Label>
            <Input
              id="card-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              value={values.phone}
              onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
              aria-invalid={Boolean(clientErrors.phone)}
            />
            {clientErrors.phone ? (
              <p className="text-xs text-zinc-600">{clientErrors.phone}</p>
            ) : null}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="card-value">Valor</Label>
          <Input
            id="card-value"
            name="value"
            inputMode="decimal"
            placeholder="0,00"
            value={values.value}
            onChange={(e) => setValues((v) => ({ ...v, value: e.target.value }))}
            aria-invalid={Boolean(clientErrors.value)}
          />
          {clientErrors.value ? (
            <p className="text-xs text-zinc-600">{clientErrors.value}</p>
          ) : (
            <p className="text-xs text-zinc-400">Valor em reais (BRL). Opcional.</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="card-stage">Estágio</Label>
          <select
            id="card-stage"
            name="stage"
            value={values.stage}
            onChange={(e) => setValues((v) => ({ ...v, stage: e.target.value as CardStage }))}
            aria-invalid={Boolean(clientErrors.stage)}
            className={selectClassName}
          >
            {CARD_STAGES.map((stage) => (
              <option key={stage} value={stage}>
                {cardStageLabel(stage)}
              </option>
            ))}
          </select>
          {clientErrors.stage ? (
            <p className="text-xs text-zinc-600">{clientErrors.stage}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="card-notes">Observações</Label>
          <textarea
            id="card-notes"
            name="notes"
            rows={3}
            value={values.notes}
            onChange={(e) => setValues((v) => ({ ...v, notes: e.target.value }))}
            aria-invalid={Boolean(clientErrors.notes)}
            className={textareaClassName}
          />
          {clientErrors.notes ? (
            <p className="text-xs text-zinc-600">{clientErrors.notes}</p>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Criando…' : 'Criar negócio'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
