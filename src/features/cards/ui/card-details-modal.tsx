import type { Card } from '@/entities/card/types';
import { Modal } from '@/shared/ui/modal';
import { cardStageLabel } from '../lib/card-stage-label';
import { formatCurrency } from '../lib/format-currency';

type CardDetailsModalProps = {
  card: Card | null;
  onClose: () => void;
};

export function CardDetailsModal({ card, onClose }: CardDetailsModalProps) {
  return (
    <Modal
      open={card !== null}
      onClose={onClose}
      title={
        card ? (
          <>
            <h2 className="truncate text-base font-medium tracking-tight text-zinc-900">
              {card.title}
            </h2>
            {card.companyName ? (
              <p className="mt-0.5 truncate text-xs text-zinc-500">{card.companyName}</p>
            ) : null}
          </>
        ) : null
      }
    >
      {card ? (
        <div className="flex flex-col gap-3">
          <span className="inline-flex w-fit items-center rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] font-medium text-zinc-600">
            {cardStageLabel(card.stage)}
          </span>

          {card.contactName ? <Field label="Contato" value={card.contactName} /> : null}
          {card.email ? <Field label="E-mail" value={card.email} /> : null}
          {card.phone ? <Field label="Telefone" value={card.phone} /> : null}
          <Field label="Valor" value={formatCurrency(card.value)} />
          {card.notes ? <Field label="Observações" value={card.notes} /> : null}
          <Field label="Atualizado em" value={formatUpdatedAt(card.updatedAt)} />
        </div>
      ) : null}
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
