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

function parsePrice(value: string): number | null {
  const normalized = value.trim().replace(/\./g, '').replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function formatPrice(value: string): string {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return `R$ ${value}`;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(parsed);
}

export function ProductsSettingsPanel({ organizationId, isOwner }: ProductsSettingsPanelProps) {
  const productsQuery = useProducts(organizationId);
  const createMutation = useCreateProduct();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!organizationId || !isOwner) return;

    const cleanName = name.trim();
    const parsedPrice = parsePrice(price);
    if (!cleanName) {
      setError('Informe o nome do produto.');
      return;
    }
    if (!parsedPrice) {
      setError('Informe um valor valido.');
      return;
    }

    setError(null);
    createMutation.mutate(
      {
        organizationId,
        name: cleanName,
        description: description.trim() || undefined,
        price: parsedPrice,
      },
      {
        onSuccess: () => {
          setName('');
          setPrice('');
          setDescription('');
        },
        onError: (err: unknown) => setError(formatApiError(err)),
      }
    );
  }

  return (
    <Card className="space-y-4 lg:col-span-2">
      <div className="space-y-0.5">
        <h2 className="text-xs font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          Produtos
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Produtos que o bot deve oferecer nas conversas do WhatsApp.
        </p>
      </div>

      {organizationId && isOwner ? (
        <form onSubmit={handleCreate} className="space-y-3 rounded-md border border-zinc-100 p-3 dark:border-zinc-800">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_120px]">
            <div className="space-y-1.5">
              <Label htmlFor="product-name">Nome</Label>
              <Input
                id="product-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={160}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="product-price">Valor</Label>
              <Input
                id="product-price"
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="497,00"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="product-description">Descricao</Label>
            <Input
              id="product-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
            />
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
  const [price, setPrice] = useState(product.price.replace('.', ','));
  const [description, setDescription] = useState(product.description ?? '');
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    const cleanName = name.trim();
    const parsedPrice = parsePrice(price);
    if (!cleanName) {
      setError('Informe o nome.');
      return;
    }
    if (!parsedPrice) {
      setError('Informe um valor valido.');
      return;
    }

    setError(null);
    updateMutation.mutate(
      {
        productId: product.id,
        input: {
          name: cleanName,
          price: parsedPrice,
          description: description.trim() || null,
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
    <div className="rounded-md border border-zinc-100 px-3 py-3 dark:border-zinc-800">
      {editing ? (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_120px]">
            <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={160} />
            <Input
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            placeholder="Descricao"
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" className="text-xs" onClick={handleSave} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
              <Button type="button" variant="ghost" className="text-xs" onClick={() => setEditing(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
            {product.description ? (
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {product.description}
              </p>
            ) : null}
          </div>
          {editable ? (
            <div className="flex shrink-0 flex-wrap gap-1">
              <Button type="button" variant="ghost" className="text-xs" onClick={() => setEditing(true)}>
                Editar
              </Button>
              <Button type="button" variant="ghost" className="text-xs" onClick={handleToggleActive}>
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
