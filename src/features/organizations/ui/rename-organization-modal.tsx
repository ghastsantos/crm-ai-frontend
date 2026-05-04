import { useState, type FormEvent } from 'react';
import { useLocale } from '@/features/locale/hooks/use-locale';
import { formatApiError } from '@/shared/lib/format-api-error';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Modal } from '@/shared/ui/modal';
import { useRenameOrganization } from '../hooks/use-organizations';

type RenameOrganizationModalProps = {
  open: boolean;
  organizationId: string;
  initialName: string;
  onClose: () => void;
};

export function RenameOrganizationModal({
  open,
  organizationId,
  initialName,
  onClose,
}: RenameOrganizationModalProps) {
  const { t } = useLocale();
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const mutation = useRenameOrganization();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 1) {
      setError('Informe um nome.');
      return;
    }
    setError(null);
    mutation.mutate(
      { id: organizationId, name: trimmed },
      {
        onSuccess: () => {
          onClose();
        },
        onError: (err: unknown) => {
          setError(formatApiError(err));
        },
      }
    );
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        if (!mutation.isPending) onClose();
      }}
      title={
        <h2 className="text-base font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
          {t('organizations.rename.title')}
        </h2>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        {error ? (
          <p className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
            {error}
          </p>
        ) : null}
        <div className="space-y-1.5">
          <Label htmlFor="rename-org">{t('organizations.rename.field')}</Label>
          <Input
            id="rename-org"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            maxLength={200}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={mutation.isPending}>
            {t('organizations.delete.cancel')}
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? t('settings.profile.saving') : t('organizations.rename.save')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
