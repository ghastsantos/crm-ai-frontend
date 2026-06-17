import { type ReactNode, useEffect } from 'react';

type AuthLayoutProps = {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  visual?: ReactNode;
};

export function AuthLayout({ title, description, children, footer, visual }: AuthLayoutProps) {
  useEffect(() => {
    const root = document.documentElement;
    const previousLang = root.lang;
    const hadDarkClass = root.classList.contains('dark');
    const previousTheme = root.dataset.theme;

    root.lang = 'pt-BR';
    root.classList.remove('dark');
    root.dataset.theme = 'light';

    return () => {
      root.lang = previousLang;
      root.classList.toggle('dark', hadDarkClass);

      if (previousTheme) {
        root.dataset.theme = previousTheme;
      } else {
        delete root.dataset.theme;
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-white text-zinc-950">
      <div className="grid min-h-screen lg:grid-cols-[1.35fr_0.65fr]">
        <section className="hidden min-h-screen overflow-hidden bg-white lg:block">
          {visual ?? (
            <div className="flex h-full items-center justify-center bg-white px-10">
              <div className="max-w-md">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-zinc-400">
                  CRM AI
                </p>

                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-950">
                  Ambiente profissional e objetivo.
                </h2>

                <p className="mt-4 text-sm leading-6 text-zinc-500">
                  Acesse seu espaço de trabalho com uma experiência simples, clara e elegante.
                </p>
              </div>
            </div>
          )}
        </section>

        <section className="relative flex min-h-screen items-center justify-center border-l border-zinc-200 bg-zinc-50/70 px-8 py-12">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,248,248,0.96))]" />
          <div className="absolute right-10 top-10 h-24 w-24 rounded-full border border-zinc-200/80" />
          <div className="absolute left-[-20px] top-1/2 h-10 w-10 -translate-y-1/2 rounded-full border border-zinc-200 bg-white" />

          <div className="relative z-10 w-full max-w-[360px]">
            <div className="mb-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-950" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
                  CRM AI
                </span>
              </div>

              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-zinc-950">{title}</h1>

              {description ? (
                <p className="mt-3 text-sm leading-6 text-zinc-500">{description}</p>
              ) : null}
            </div>

            <div className="space-y-6">{children}</div>

            {footer ? (
              <div className="mt-8 border-t border-zinc-200 pt-6 text-sm text-zinc-500">
                {footer}
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
