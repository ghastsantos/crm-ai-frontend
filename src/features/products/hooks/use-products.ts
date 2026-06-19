import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createProduct,
  deleteProduct,
  fetchProducts,
  updateProduct,
  type CreateProductInput,
  type UpdateProductInput,
} from '@/features/products/api/products-api';

export function useProducts(organizationId: string | undefined) {
  return useQuery({
    queryKey: ['products', organizationId],
    queryFn: () => fetchProducts(organizationId as string),
    enabled: Boolean(organizationId),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProductInput) => createProduct(input),
    onSuccess: (product) => {
      void queryClient.invalidateQueries({ queryKey: ['products', product.organizationId] });
    },
  });
}

export function useUpdateProduct(organizationId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, input }: { productId: string; input: UpdateProductInput }) =>
      updateProduct(productId, input),
    onSuccess: (product) => {
      void queryClient.invalidateQueries({
        queryKey: ['products', organizationId ?? product.organizationId],
      });
    },
  });
}

export function useDeleteProduct(organizationId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => deleteProduct(productId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['products', organizationId] });
    },
  });
}
