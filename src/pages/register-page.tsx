import { RegisterFooter, RegisterForm } from '@/features/auth/ui/register-form';
import { AuthLayout } from '@/shared/ui/auth-layout';

export function RegisterPage() {
  return (
    <AuthLayout
      title="Criar conta"
      description="Configure sua organização e seu usuário."
      footer={<RegisterFooter />}
    >
      <RegisterForm />
    </AuthLayout>
  );
}
