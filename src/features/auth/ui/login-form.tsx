import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginRequest } from '@/features/auth/api/auth-api';
import { useSession } from '@/features/auth/hooks/use-session';
import { loginFormSchema, type LoginFormValues } from '@/features/auth/model/schemas';
import { env } from '@/shared/config/env';
import { formatApiError } from '@/shared/lib/format-api-error';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

const initialValues: LoginFormValues = {
  email: '',
  password: '',
};

export function LoginForm() {
  const [values, setValues] = useState<LoginFormValues>(initialValues);
  const [clientErrors, setClientErrors] = useState<Partial<Record<keyof LoginFormValues, string>>>(
    {}
  );
  const [formError, setFormError] = useState<string | null>(null);
  const { setBearerToken, markCookieBackedSession } = useSession();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: loginRequest,
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
    const parsed = loginFormSchema.safeParse(values);
    if (!parsed.success) {
      const fe = parsed.error.flatten().fieldErrors;
      setClientErrors({
        email: fe.email?.[0],
        password: fe.password?.[0],
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
          <Label htmlFor="login-email">E-mail</Label>
          <Input
            id="login-email"
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
          <Label htmlFor="login-password">Senha</Label>
          <Input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={values.password}
            onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
            aria-invalid={Boolean(clientErrors.password)}
          />
          {clientErrors.password ? (
            <p className="text-xs text-zinc-600">{clientErrors.password}</p>
          ) : null}
        </div>
        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>
    </Card>
  );
}

export function LoginFooter() {
  return (
    <p>
      Não tem uma conta?{' '}
      <Link to="/register" className="font-medium text-zinc-900 underline-offset-4 hover:underline">
        Cadastre-se
      </Link>
    </p>
  );
}
