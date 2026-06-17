import { useState, type FormEvent } from 'react';
import { useLocale } from '@/features/locale/hooks/use-locale';
import { formatApiError } from '@/shared/lib/format-api-error';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Modal } from '@/shared/ui/modal';
import { useCreateOrganization } from '../hooks/use-organizations';

type CreateOrganizationModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated?: (organizationId: string) => void;
};

export function CreateOrganizationModal({
  open,
  onClose,
  onCreated,
}: CreateOrganizationModalProps) {
  const { t } = useLocale();
  const [name, setName] = useState('');
  const [niche, setNiche] = useState('');
  const [error, setError] = useState<string | null>(null);
  const mutation = useCreateOrganization();

  function reset() {
    setName('');
    setNiche('');
    setError(null);
  }

  function handleClose() {
    if (mutation.isPending) return;
    reset();
    onClose();
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 1) {
      setError(t('organizations.create.required'));
      return;
    }
    const trimmedNiche = niche.trim();
    if (trimmedNiche.length < 1) {
      setError(t('organizations.create.niche_required'));
      return;
    }
    setError(null);
    mutation.mutate(
      { name: trimmed, niche: trimmedNiche },
      {
        onSuccess: (org) => {
          onCreated?.(org.id);
          reset();
          onClose();
        },
        onError: (err: unknown) => setError(formatApiError(err)),
      }
    );
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={
        <>
          <h2 className="text-base font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
            {t('organizations.create.title')}
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            {t('organizations.create.description')}
          </p>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        {error ? (
          <p className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
            {error}
          </p>
        ) : null}
        <div className="space-y-1.5">
          <Label htmlFor="create-org">{t('organizations.create.field')}</Label>
          <Input
            id="create-org"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('organizations.create.placeholder')}
            autoFocus
            maxLength={200}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="create-org-niche">{t('organizations.create.niche_field')}</Label>
          <Input
            id="create-org-niche"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            placeholder={t('organizations.create.niche_placeholder')}
            maxLength={120}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={mutation.isPending}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? t('common.creating') : t('organizations.create.save')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
