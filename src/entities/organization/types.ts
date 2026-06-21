export type PixKeyType = 'CPF' | 'CNPJ' | 'PHONE' | 'EMAIL' | 'RANDOM';

export type Organization = {
  id: string;
  name: string;
  niche: string;
  pixKey: string | null;
  pixKeyType: PixKeyType | null;
  role: string;
  createdAt: string;
  updatedAt: string;
};
