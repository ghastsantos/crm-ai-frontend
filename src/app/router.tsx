import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AuthSessionSync } from '@/features/auth/ui/auth-session-sync';
import { useSessionActive } from '@/features/auth/hooks/use-session-active';
import { HomePage } from '@/pages/home-page';
import { LoginPage } from '@/pages/login-page';
import { RegisterPage } from '@/pages/register-page';
import { SettingsPage } from '@/pages/settings-page';
import { MembersPage } from '@/pages/admin/members-page';
import { PipelineLogsPage } from '@/pages/admin/pipeline-logs-page';
import { AppShell } from '@/widgets/app-shell/AppShell';

function RequireAuth() {
  const active = useSessionActive();

  if (!active) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function GuestOnly() {
  const active = useSessionActive();

  if (active) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

function CatchAll() {
  const active = useSessionActive();

  return <Navigate to={active ? '/' : '/login'} replace />;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthSessionSync />

      <Routes>
        <Route element={<GuestOnly />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/admin/members" element={<MembersPage />} />
            <Route path="/admin/pipeline-logs" element={<PipelineLogsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<CatchAll />} />
      </Routes>
    </BrowserRouter>
  );
}
