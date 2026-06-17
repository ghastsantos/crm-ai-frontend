import { apiRequest } from '@/shared/api/client';

export type Product = {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  price: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateProductInput = {
  organizationId: string;
  name: string;
  description?: string;
  price: number;
  active?: boolean;
};

export type UpdateProductInput = {
  name?: string;
  description?: string | null;
  price?: number;
  active?: boolean;
};

export async function fetchProducts(organizationId: string): Promise<Product[]> {
  return apiRequest<Product[]>(
    `/api/v1/products?organizationId=${encodeURIComponent(organizationId)}`
  );
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  return apiRequest<Product>('/api/v1/products', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateProduct(productId: string, input: UpdateProductInput): Promise<Product> {
  return apiRequest<Product>(`/api/v1/products/${productId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteProduct(productId: string): Promise<void> {
  await apiRequest(`/api/v1/products/${productId}`, {
    method: 'DELETE',
  });
}
