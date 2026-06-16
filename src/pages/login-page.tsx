import { type CSSProperties } from 'react';
import { LoginFooter, LoginForm } from '@/features/auth/ui/login-form';
import { AuthLayout } from '@/shared/ui/auth-layout';

function LoginVisual() {
  const latitudes = [-128, -104, -80, -56, -32, -8, 16, 40, 64, 88, 112, 136];
  const meridians = [-72, -48, -24, 0, 24, 48, 72];

  const nodes = [
    { left: '12%', top: '22%', delay: '0s' },
    { left: '22%', top: '34%', delay: '0.7s' },
    { left: '16%', top: '67%', delay: '1.2s' },
    { left: '34%', top: '18%', delay: '1.8s' },
    { left: '70%', top: '25%', delay: '0.4s' },
    { left: '82%', top: '42%', delay: '1.4s' },
    { left: '74%', top: '70%', delay: '2s' },
    { left: '55%', top: '82%', delay: '0.9s' },
  ];

  return (
    <div className="relative flex h-full min-h-screen items-center justify-center overflow-hidden bg-white">
      <style>
        {`
          @keyframes authGridMove {
            0% {
              background-position: 0 0, 0 0;
            }
            100% {
              background-position: 80px 80px, -80px -80px;
            }
          }

          @keyframes authOrbFloat {
            0% {
              transform: translateY(0) scale(1) rotate(0deg);
            }
            50% {
              transform: translateY(-14px) scale(1.035) rotate(5deg);
            }
            100% {
              transform: translateY(0) scale(1) rotate(0deg);
            }
          }

          @keyframes authOrbSpin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }

          @keyframes authOrbReverseSpin {
            0% {
              transform: rotate(360deg);
            }
            100% {
              transform: rotate(0deg);
            }
          }

          @keyframes authStrokeFlow {
            0% {
              stroke-dashoffset: 220;
              opacity: 0.18;
            }
            50% {
              opacity: 0.75;
            }
            100% {
              stroke-dashoffset: 0;
              opacity: 0.18;
            }
          }

          @keyframes authNodePulse {
            0%, 100% {
              transform: scale(1);
              opacity: 0.35;
            }
            50% {
              transform: scale(1.8);
              opacity: 1;
            }
          }

          @keyframes authScan {
            0% {
              transform: translateY(-170px);
              opacity: 0;
            }
            15% {
              opacity: 0.8;
            }
            85% {
              opacity: 0.8;
            }
            100% {
              transform: translateY(170px);
              opacity: 0;
            }
          }

          @keyframes authConnectorPulse {
            0%, 100% {
              opacity: 0.12;
              transform: scaleX(0.88);
            }
            50% {
              opacity: 0.45;
              transform: scaleX(1.04);
            }
          }

          @keyframes authParticleDrift {
            0% {
              transform: translate3d(0, 0, 0);
              opacity: 0.25;
            }
            50% {
              transform: translate3d(10px, -14px, 0);
              opacity: 0.85;
            }
            100% {
              transform: translate3d(0, 0, 0);
              opacity: 0.25;
            }
          }

          .auth-grid {
            background-image:
              linear-gradient(rgba(24,24,27,0.035) 1px, transparent 1px),
              linear-gradient(90deg, rgba(24,24,27,0.035) 1px, transparent 1px);
            background-size: 40px 40px;
            animation: authGridMove 18s linear infinite;
          }

          .auth-orb-float {
            animation: authOrbFloat 8s ease-in-out infinite;
          }

          .auth-orb-spin {
            animation: authOrbSpin 26s linear infinite;
          }

          .auth-orb-reverse-spin {
            animation: authOrbReverseSpin 34s linear infinite;
          }

          .auth-stroke-flow {
            stroke-dasharray: 12 18;
            animation: authStrokeFlow 5s ease-in-out infinite;
          }

          .auth-node-pulse {
            animation: authNodePulse 3.8s ease-in-out infinite;
          }

          .auth-scan {
            animation: authScan 4.8s ease-in-out infinite;
          }

          .auth-connector-pulse {
            transform-origin: center;
            animation: authConnectorPulse 4.5s ease-in-out infinite;
          }

          .auth-particle-drift {
            animation: authParticleDrift 5s ease-in-out infinite;
          }
        `}
      </style>

      <div className="auth-grid absolute inset-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(24,24,27,0.09),transparent_44%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.95),rgba(250,250,250,0.8))]" />

      <svg
        className="pointer-events-none absolute h-full w-full"
        viewBox="0 0 1000 800"
        fill="none"
        aria-hidden="true"
      >
        <path
          className="auth-stroke-flow"
          d="M130 210 C260 180, 320 260, 430 250"
          stroke="rgb(113 113 122)"
          strokeWidth="1"
        />
        <path
          className="auth-stroke-flow"
          d="M128 540 C250 520, 320 430, 430 455"
          stroke="rgb(161 161 170)"
          strokeWidth="1"
          style={{ animationDelay: '0.8s' }}
        />
        <path
          className="auth-stroke-flow"
          d="M570 250 C700 210, 760 250, 870 190"
          stroke="rgb(113 113 122)"
          strokeWidth="1"
          style={{ animationDelay: '1.4s' }}
        />
        <path
          className="auth-stroke-flow"
          d="M570 455 C690 470, 750 570, 870 535"
          stroke="rgb(161 161 170)"
          strokeWidth="1"
          style={{ animationDelay: '2.1s' }}
        />
      </svg>

      <div className="pointer-events-none absolute inset-0">
        {nodes.map((node) => (
          <span
            key={`${node.left}-${node.top}`}
            className="auth-particle-drift absolute h-2 w-2 rounded-full bg-zinc-900"
            style={
              {
                left: node.left,
                top: node.top,
                animationDelay: node.delay,
              } as CSSProperties
            }
          />
        ))}

        <div className="auth-connector-pulse absolute left-[12%] top-[22%] h-px w-[220px] rotate-[18deg] bg-zinc-300" />
        <div className="auth-connector-pulse absolute left-[15%] top-[66%] h-px w-[250px] -rotate-[20deg] bg-zinc-300" />
        <div className="auth-connector-pulse absolute right-[13%] top-[34%] h-px w-[230px] -rotate-[14deg] bg-zinc-300" />
        <div className="auth-connector-pulse absolute right-[14%] top-[70%] h-px w-[240px] rotate-[18deg] bg-zinc-300" />
      </div>

      <div className="auth-orb-float relative flex h-[430px] w-[430px] items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-zinc-200" />
        <div className="absolute inset-[18px] rounded-full border border-zinc-300/70" />
        <div className="absolute inset-[42px] rounded-full border border-zinc-300/45" />
        <div className="absolute inset-[70px] rounded-full border border-zinc-300/25" />

        <div className="auth-orb-spin absolute inset-0 rounded-full border border-dashed border-zinc-300/80" />
        <div className="auth-orb-reverse-spin absolute inset-[26px] rounded-full border border-dashed border-zinc-300/60" />

        <svg
          className="relative h-[390px] w-[390px]"
          viewBox="0 0 520 520"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="260" cy="260" r="190" stroke="rgb(39 39 42)" strokeOpacity="0.22" />
          <circle cx="260" cy="260" r="158" stroke="rgb(82 82 91)" strokeOpacity="0.18" />
          <circle cx="260" cy="260" r="118" stroke="rgb(113 113 122)" strokeOpacity="0.16" />

          {latitudes.map((y) => {
            const rx = Math.sqrt(Math.max(0, 1 - (y / 150) ** 2)) * 184;

            return (
              <ellipse
                key={y}
                cx="260"
                cy={260 + y}
                rx={rx}
                ry={Math.max(3, rx * 0.13)}
                stroke="rgb(39 39 42)"
                strokeOpacity="0.22"
              />
            );
          })}

          {meridians.map((x) => (
            <ellipse
              key={x}
              cx="260"
              cy="260"
              rx={Math.max(18, 188 - Math.abs(x) * 1.7)}
              ry="190"
              stroke="rgb(39 39 42)"
              strokeOpacity="0.2"
              transform={`rotate(${x} 260 260)`}
            />
          ))}

          <line x1="78" y1="260" x2="442" y2="260" stroke="rgb(39 39 42)" strokeOpacity="0.32" />
          <line x1="260" y1="72" x2="260" y2="448" stroke="rgb(39 39 42)" strokeOpacity="0.12" />

          <path
            className="auth-stroke-flow"
            d="M118 184 C188 132, 320 126, 398 190"
            stroke="rgb(24 24 27)"
            strokeWidth="1.4"
          />
          <path
            className="auth-stroke-flow"
            d="M115 336 C205 390, 320 394, 405 328"
            stroke="rgb(24 24 27)"
            strokeWidth="1.4"
            style={{ animationDelay: '1.3s' }}
          />

          <circle className="auth-node-pulse" cx="174" cy="170" r="4" fill="rgb(24 24 27)" />
          <circle
            className="auth-node-pulse"
            cx="356"
            cy="190"
            r="4"
            fill="rgb(24 24 27)"
            style={{ animationDelay: '0.9s' }}
          />
          <circle
            className="auth-node-pulse"
            cx="386"
            cy="326"
            r="4"
            fill="rgb(24 24 27)"
            style={{ animationDelay: '1.7s' }}
          />
          <circle
            className="auth-node-pulse"
            cx="160"
            cy="338"
            r="4"
            fill="rgb(24 24 27)"
            style={{ animationDelay: '2.4s' }}
          />
        </svg>

        <div className="auth-scan absolute h-px w-[360px] bg-zinc-950/50 shadow-[0_0_28px_rgba(24,24,27,0.25)]" />

        <div className="absolute h-3 w-3 rounded-full bg-zinc-950 shadow-[0_0_30px_rgba(24,24,27,0.45)]" />

        <div className="auth-orb-spin absolute inset-[52px] rounded-full">
          <div className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-zinc-950 shadow-[0_0_20px_rgba(24,24,27,0.35)]" />
          <div className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-zinc-700" />
        </div>
      </div>

      <div className="absolute bottom-10 left-10 max-w-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-zinc-400">CRM AI</p>

        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-950">
          Gestão inteligente, visual limpo e controle comercial.
        </h2>

        <p className="mt-4 text-sm leading-6 text-zinc-500">
          Organize leads, acompanhe oportunidades e mantenha seu fluxo de trabalho mais claro.
        </p>
      </div>
    </div>
  );
}

export function LoginPage() {
  return (
    <AuthLayout
      title="Entrar"
      description="Acesse seu ambiente de trabalho."
      footer={<LoginFooter />}
      visual={<LoginVisual />}
    >
      <LoginForm />
    </AuthLayout>
  );
}
