import { useState } from 'react';
import { useLocale } from '@/features/locale/hooks/use-locale';
import { formatApiError } from '@/shared/lib/format-api-error';
import { Button } from '@/shared/ui/button';
import { Modal } from '@/shared/ui/modal';
import { useDeleteOrganization } from '../hooks/use-organizations';

type DeleteOrganizationModalProps = {
  open: boolean;
  organizationId: string;
  organizationName: string;
  onClose: () => void;
  onDeleted?: (deletedId: string) => void;
};

export function DeleteOrganizationModal({
  open,
  organizationId,
  organizationName,
  onClose,
  onDeleted,
}: DeleteOrganizationModalProps) {
  const { t } = useLocale();
  const [error, setError] = useState<string | null>(null);
  const mutation = useDeleteOrganization();

  function handleConfirm() {
    setError(null);
    mutation.mutate(
      { id: organizationId },
      {
        onSuccess: () => {
          onDeleted?.(organizationId);
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
          {t('organizations.delete.title')}
        </h2>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          <span className="font-medium text-zinc-900 dark:text-zinc-100">{organizationName}</span>
        </p>
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
          {t('organizations.delete.warning')}
        </p>
        {error ? (
          <p className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
            {error}
          </p>
        ) : null}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={mutation.isPending}>
            {t('organizations.delete.cancel')}
          </Button>
          <Button
            type="button"
            className="bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-300"
            onClick={handleConfirm}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? t('settings.profile.saving') : t('organizations.delete.confirm')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
