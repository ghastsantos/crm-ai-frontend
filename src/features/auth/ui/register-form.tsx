import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerRequest } from '@/features/auth/api/auth-api';
import { useSession } from '@/features/auth/hooks/use-session';
import { env } from '@/shared/config/env';
import { registerFormSchema, type RegisterFormValues } from '@/features/auth/model/schemas';
import { formatApiError } from '@/shared/lib/format-api-error';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

const initialValues: RegisterFormValues = {
  email: '',
  password: '',
  name: '',
  organizationName: '',
  organizationNiche: '',
};

export function RegisterForm() {
  const [values, setValues] = useState<RegisterFormValues>(initialValues);
  const [clientErrors, setClientErrors] = useState<
    Partial<Record<keyof RegisterFormValues, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const { setBearerToken, markCookieBackedSession } = useSession();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: registerRequest,
    onSuccess: (data) => {
      if (env.VITE_AUTH_HTTPONLY_COOKIE) {
        markCookieBackedSession();
      } else if (data.token) {
        setBearerToken(data.token);
      }
      void queryClient.invalidateQueries({ queryKey: ['me'] });
      navigate('/');
    },
    onError: (err: unknown) => {
      setFormError(formatApiError(err));
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setClientErrors({});
    const parsed = registerFormSchema.safeParse(values);
    if (!parsed.success) {
      const fe = parsed.error.flatten().fieldErrors;
      setClientErrors({
        email: fe.email?.[0],
        password: fe.password?.[0],
        name: fe.name?.[0],
        organizationName: fe.organizationName?.[0],
        organizationNiche: fe.organizationNiche?.[0],
      });
      return;
    }
    mutation.mutate(parsed.data);
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError ? (
          <p className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-700">
            {formError}
          </p>
        ) : null}
        <div className="space-y-1.5">
          <Label htmlFor="register-name">Nome</Label>
          <Input
            id="register-name"
            name="name"
            autoComplete="name"
            value={values.name}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
            aria-invalid={Boolean(clientErrors.name)}
          />
          {clientErrors.name ? <p className="text-xs text-zinc-600">{clientErrors.name}</p> : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="register-org">Organização</Label>
          <Input
            id="register-org"
            name="organizationName"
            autoComplete="organization"
            value={values.organizationName}
            onChange={(e) => setValues((v) => ({ ...v, organizationName: e.target.value }))}
            aria-invalid={Boolean(clientErrors.organizationName)}
          />
          {clientErrors.organizationName ? (
            <p className="text-xs text-zinc-600">{clientErrors.organizationName}</p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="register-niche">Nicho da empresa</Label>
          <Input
            id="register-niche"
            name="organizationNiche"
            autoComplete="off"
            value={values.organizationNiche}
            onChange={(e) => setValues((v) => ({ ...v, organizationNiche: e.target.value }))}
            aria-invalid={Boolean(clientErrors.organizationNiche)}
          />
          {clientErrors.organizationNiche ? (
            <p className="text-xs text-zinc-600">{clientErrors.organizationNiche}</p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="register-email">E-mail</Label>
          <Input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
            aria-invalid={Boolean(clientErrors.email)}
          />
          {clientErrors.email ? (
            <p className="text-xs text-zinc-600">{clientErrors.email}</p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="register-password">Senha</Label>
          <Input
            id="register-password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={values.password}
            onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
            aria-invalid={Boolean(clientErrors.password)}
          />
          {clientErrors.password ? (
            <p className="text-xs text-zinc-600">{clientErrors.password}</p>
          ) : null}
          <p className="text-xs text-zinc-400">Mínimo de 8 caracteres.</p>
        </div>
        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? 'Criando conta…' : 'Criar conta'}
        </Button>
      </form>
    </Card>
  );
}

export function RegisterFooter() {
  return (
    <p>
      Já tem uma conta?{' '}
      <Link to="/login" className="font-medium text-zinc-900 underline-offset-4 hover:underline">
        Entrar
      </Link>
    </p>
  );
}
