import { Outlet } from 'react-router-dom';
import { AppHeader } from '@/widgets/app-header/AppHeader';

export function AppShell() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-8 lg:max-w-[1600px] lg:px-8 lg:py-10">
        <Outlet />
      </main>
    </div>
  );
}
