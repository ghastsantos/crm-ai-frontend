import { Outlet } from 'react-router-dom';
import { AppHeader } from '@/widgets/app-header/AppHeader';

export function AppShell() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-zinc-50 dark:bg-zinc-950">
      <AppHeader />
      <main className="mx-auto w-full max-w-5xl min-w-0 px-4 py-8 lg:max-w-[1600px] lg:px-8 lg:py-10">
        <Outlet />
      </main>
    </div>
  );
}
