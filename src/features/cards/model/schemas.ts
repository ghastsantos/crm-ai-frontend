import { z } from 'zod';
import { CARD_STAGES } from '@/entities/card/types';

const optionalTrimmed = (max: number, message: string) =>
  z
    .string()
    .trim()
    .max(max, { message })
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined));

export const createCardFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, { message: 'Informe o título do negócio' })
    .max(200, { message: 'Título muito longo' }),
  companyName: optionalTrimmed(200, 'Nome da empresa muito longo'),
  contactName: optionalTrimmed(200, 'Nome do contato muito longo'),
  value: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined))
    .pipe(
      z
        .string()
        .regex(/^\d+([.,]\d{1,2})?$/, { message: 'Informe um valor numérico válido' })
        .transform((v) => Number(v.replace(',', '.')))
        .refine((n) => n > 0, { message: 'Valor deve ser maior que zero' })
        .refine((n) => n <= 1_000_000_000, { message: 'Valor muito alto' })
        .optional()
    ),
  email: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined))
    .pipe(z.string().email({ message: 'E-mail inválido' }).max(320).optional()),
  phone: optionalTrimmed(50, 'Telefone muito longo'),
  notes: optionalTrimmed(500, 'Observações muito longas'),
  stage: z.enum(CARD_STAGES, { message: 'Selecione um estágio' }),
});

export type CreateCardFormValues = z.infer<typeof createCardFormSchema>;
