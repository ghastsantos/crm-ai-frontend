import { useState, type FormEvent } from 'react';
import type { Card } from '@/entities/card/types';
import type { PipelineColumn } from '@/entities/pipeline-column/types';
import { formatApiError } from '@/shared/lib/format-api-error';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Modal } from '@/shared/ui/modal';
import { useDeleteCard, useUpdateCard } from '../hooks/use-cards';
import { editCardFormSchema } from '../model/schemas';
import { formatCurrency } from '../lib/format-currency';

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

  const columnTitle = columns.find((c) => c.id === card.pipelineColumnId)?.title ?? 'Coluna';

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
    if (!window.confirm('Excluir este negócio? Esta ação não pode ser desfeita.')) return;
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
          <h2 className="truncate text-base font-medium tracking-tight text-zinc-900">
            {card.title}
          </h2>
          <p className="mt-0.5 truncate text-xs text-zinc-500">{columnTitle}</p>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        {formError ? (
          <p className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-700">
            {formError}
          </p>
        ) : null}

        {editing ? (
          <form onSubmit={handleSave} className="space-y-3">
            {clientError ? <p className="text-xs text-zinc-600">{clientError}</p> : null}
            <div className="space-y-1.5">
              <Label htmlFor="edit-title">Título</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                aria-invalid={Boolean(clientError)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-value">Valor (BRL)</Label>
              <Input
                id="edit-value"
                inputMode="decimal"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-email">E-mail</Label>
              <Input
                id="edit-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-phone">Telefone</Label>
              <Input
                id="edit-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-notes">Observações</Label>
              <textarea
                id="edit-notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="flex min-h-[72px] w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-zinc-200"
              />
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Salvando…' : 'Salvar'}
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
                Cancelar
              </Button>
            </div>
          </form>
        ) : (
          <>
            <span className="inline-flex w-fit items-center rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] font-medium text-zinc-600">
              {columnTitle}
            </span>
            {card.email ? <Field label="E-mail" value={card.email} /> : null}
            {card.phone ? <Field label="Telefone" value={card.phone} /> : null}
            <Field label="Valor" value={formatCurrency(card.value)} />
            {card.notes ? <Field label="Observações" value={card.notes} /> : null}
            <Field label="Atualizado em" value={formatUpdatedAt(card.updatedAt)} />
            <div className="flex flex-wrap gap-2 border-t border-zinc-100 pt-3">
              <Button
                type="button"
                variant="ghost"
                className="text-xs"
                onClick={() => setEditing(true)}
              >
                Editar
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="text-xs text-red-700 hover:bg-red-50"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Excluindo…' : 'Excluir'}
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
    <div className="border-t border-zinc-100 pt-3">
      <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-400">{label}</p>
      <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-900">{value}</p>
    </div>
  );
}

function formatUpdatedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
