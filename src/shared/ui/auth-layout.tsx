import { useEffect, type ReactNode } from 'react';

type AuthLayoutProps = {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
  useEffect(() => {
    const root = document.documentElement;
    const previousTheme = root.dataset.theme;
    const previousLang = root.lang;
    const hadDarkClass = root.classList.contains('dark');

    root.classList.remove('dark');
    root.dataset.theme = 'light';
    root.lang = 'pt-BR';

    return () => {
      root.classList.toggle('dark', hadDarkClass);
      if (previousTheme) {
        root.dataset.theme = previousTheme;
      } else {
        delete root.dataset.theme;
      }
      root.lang = previousLang;
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">CRM</p>
          <h1 className="mt-2 text-xl font-medium tracking-tight text-zinc-900">{title}</h1>
          {description ? <p className="mt-1 text-sm text-zinc-500">{description}</p> : null}
        </div>
        {children}
        {footer ? <div className="mt-6 text-center text-xs text-zinc-500">{footer}</div> : null}
      </div>
    </div>
  );
}
