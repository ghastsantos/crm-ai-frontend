import { useState, type FormEvent } from 'react';
import type { Product } from '@/features/products/api/products-api';
import {
  useCreateProduct,
  useDeleteProduct,
  useProducts,
  useUpdateProduct,
} from '@/features/products/hooks/use-products';
import { formatApiError } from '@/shared/lib/format-api-error';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

type ProductsSettingsPanelProps = {
  organizationId: string | undefined;
  isOwner: boolean;
};

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function onlyDigits(value: string): string {
  return value.replace(/\D/g, '').slice(0, 11);
}

function centsToNumber(value: string): number | null {
  const cents = Number(value);
  if (!Number.isFinite(cents) || cents <= 0) return null;
  return cents / 100;
}

function formatCurrencyFromDigits(value: string): string {
  if (!value) return '';
  return currencyFormatter.format(Number(value) / 100);
}

function digitsFromDecimal(value: string): string {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return '';
  return String(Math.round(parsed * 100));
}

function formatPrice(value: string): string {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return value;
  return currencyFormatter.format(parsed);
}

export function ProductsSettingsPanel({ organizationId, isOwner }: ProductsSettingsPanelProps) {
  const productsQuery = useProducts(organizationId);
  const createMutation = useCreateProduct();
  const [name, setName] = useState('');
  const [priceDigits, setPriceDigits] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleCreate(event: FormEvent) {
    event.preventDefault();
    if (!organizationId || !isOwner) return;

    const cleanName = name.trim();
    const price = centsToNumber(priceDigits);
    if (!cleanName) {
      setError('Informe o nome do produto.');
      return;
    }
    if (!price) {
      setError('Informe um valor válido.');
      return;
    }

    setError(null);
    createMutation.mutate(
      {
        organizationId,
        name: cleanName,
        price,
      },
      {
        onSuccess: () => {
          setName('');
          setPriceDigits('');
        },
        onError: (err: unknown) => setError(formatApiError(err)),
      }
    );
  }

  return (
    <Card className="space-y-4">
      <div className="space-y-0.5">
        <h2 className="text-xs font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          Produtos
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Produtos que o bot deve oferecer nas conversas do WhatsApp.
        </p>
      </div>

      {organizationId && isOwner ? (
        <form
          onSubmit={handleCreate}
          className="space-y-3 rounded-lg border border-zinc-100 bg-zinc-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-900/50"
        >
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_150px]">
            <div className="space-y-1.5">
              <Label htmlFor="product-name">Nome</Label>
              <Input
                id="product-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={80}
                placeholder="Ex: Mentoria"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="product-price">Valor</Label>
              <Input
                id="product-price"
                inputMode="numeric"
                value={formatCurrencyFromDigits(priceDigits)}
                onChange={(event) => setPriceDigits(onlyDigits(event.target.value))}
                placeholder="R$ 0,00"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Salvando...' : 'Adicionar produto'}
            </Button>
          </div>
        </form>
      ) : (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Apenas administradores podem cadastrar produtos.
        </p>
      )}

      <div className="space-y-2">
        {productsQuery.isLoading ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Carregando produtos...</p>
        ) : productsQuery.data?.length ? (
          productsQuery.data.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              organizationId={organizationId}
              editable={Boolean(isOwner)}
            />
          ))
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Nenhum produto cadastrado ainda.
          </p>
        )}
      </div>
    </Card>
  );
}

function ProductRow({
  product,
  organizationId,
  editable,
}: {
  product: Product;
  organizationId: string | undefined;
  editable: boolean;
}) {
  const updateMutation = useUpdateProduct(organizationId);
  const deleteMutation = useDeleteProduct(organizationId);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(product.name);
  const [priceDigits, setPriceDigits] = useState(digitsFromDecimal(product.price));
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    const cleanName = name.trim();
    const price = centsToNumber(priceDigits);
    if (!cleanName) {
      setError('Informe o nome.');
      return;
    }
    if (!price) {
      setError('Informe um valor válido.');
      return;
    }

    setError(null);
    updateMutation.mutate(
      {
        productId: product.id,
        input: {
          name: cleanName,
          price,
          description: null,
        },
      },
      {
        onSuccess: () => setEditing(false),
        onError: (err: unknown) => setError(formatApiError(err)),
      }
    );
  }

  function handleToggleActive() {
    updateMutation.mutate({
      productId: product.id,
      input: { active: !product.active },
    });
  }

  function handleDelete() {
    if (!window.confirm(`Excluir ${product.name}?`)) return;
    deleteMutation.mutate(product.id);
  }

  return (
    <div className="rounded-lg border border-zinc-100 px-3 py-3 dark:border-zinc-800">
      {editing ? (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_150px]">
            <Input value={name} onChange={(event) => setName(event.target.value)} maxLength={80} />
            <Input
              inputMode="numeric"
              value={formatCurrencyFromDigits(priceDigits)}
              onChange={(event) => setPriceDigits(onlyDigits(event.target.value))}
              placeholder="R$ 0,00"
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                className="text-xs"
                onClick={handleSave}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="text-xs"
                onClick={() => setEditing(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {product.name}
              </p>
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                {product.active ? 'Ativo' : 'Pausado'}
              </span>
            </div>
            <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
              {formatPrice(product.price)}
            </p>
          </div>
          {editable ? (
            <div className="flex shrink-0 flex-wrap gap-1">
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
                className="text-xs"
                onClick={handleToggleActive}
              >
                {product.active ? 'Pausar' : 'Ativar'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="text-xs text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/40"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                Excluir
              </Button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
