import { LoginFooter, LoginForm } from '@/features/auth/ui/login-form';
import { AuthLayout } from '@/shared/ui/auth-layout';

export function LoginPage() {
  return (
    <AuthLayout
      title="Entrar"
      description="Acesse seu ambiente de trabalho."
      footer={<LoginFooter />}
    >
      <LoginForm />
    </AuthLayout>
  );
}
