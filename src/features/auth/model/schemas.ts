import { z } from 'zod';

export const registerFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: 'Informe o e-mail' })
    .email({ message: 'E-mail inválido' })
    .max(320, { message: 'E-mail muito longo' }),
  password: z
    .string()
    .min(8, { message: 'A senha deve ter pelo menos 8 caracteres' })
    .max(128, { message: 'Senha muito longa' }),
  name: z
    .string()
    .trim()
    .min(1, { message: 'Informe o nome' })
    .max(200, { message: 'Nome muito longo' }),
  organizationName: z
    .string()
    .trim()
    .min(1, { message: 'Informe o nome da organização' })
    .max(200, { message: 'Nome da organização muito longo' }),
});

export const loginFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: 'Informe o e-mail' })
    .email({ message: 'E-mail inválido' })
    .max(320, { message: 'E-mail muito longo' }),
  password: z
    .string()
    .min(1, { message: 'Informe a senha' })
    .max(128, { message: 'Senha muito longa' }),
});

export type RegisterFormValues = z.infer<typeof registerFormSchema>;
export type LoginFormValues = z.infer<typeof loginFormSchema>;
