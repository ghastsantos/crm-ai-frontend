import { type CSSProperties } from 'react';
import { RegisterFooter, RegisterForm } from '@/features/auth/ui/register-form';
import { AuthLayout } from '@/shared/ui/auth-layout';

function RegisterVisual() {
  const connectionNodes = [
    { left: '20%', top: '28%', delay: '0s' },
    { left: '34%', top: '18%', delay: '0.5s' },
    { left: '48%', top: '32%', delay: '1s' },
    { left: '64%', top: '22%', delay: '1.5s' },
    { left: '72%', top: '44%', delay: '0.7s' },
    { left: '55%', top: '58%', delay: '1.2s' },
    { left: '36%', top: '66%', delay: '1.8s' },
    { left: '22%', top: '52%', delay: '2.3s' },
  ];

  return (
    <div className="relative flex h-full min-h-screen items-center justify-center overflow-hidden bg-white">
      <style>
        {`
          @keyframes registerGridMove {
            0% {
              background-position: 0 0, 0 0;
            }
            100% {
              background-position: 70px 70px, -70px -70px;
            }
          }

          @keyframes registerCorePulse {
            0%, 100% {
              transform: scale(0.96);
              opacity: 0.75;
            }
            50% {
              transform: scale(1.04);
              opacity: 1;
            }
          }

          @keyframes registerOrbit {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }

          @keyframes registerReverseOrbit {
            0% {
              transform: rotate(360deg);
            }
            100% {
              transform: rotate(0deg);
            }
          }

          @keyframes registerNodePulse {
            0%, 100% {
              transform: scale(1);
              opacity: 0.35;
            }
            50% {
              transform: scale(1.75);
              opacity: 1;
            }
          }

          @keyframes registerPathFlow {
            0% {
              stroke-dashoffset: 260;
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

          @keyframes registerFloat {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-12px);
            }
          }

          @keyframes registerSignal {
            0% {
              transform: scale(0.75);
              opacity: 0;
            }
            30% {
              opacity: 0.45;
            }
            100% {
              transform: scale(1.35);
              opacity: 0;
            }
          }

          .register-grid {
            background-image:
              linear-gradient(rgba(24,24,27,0.035) 1px, transparent 1px),
              linear-gradient(90deg, rgba(24,24,27,0.035) 1px, transparent 1px);
            background-size: 42px 42px;
            animation: registerGridMove 20s linear infinite;
          }

          .register-core-pulse {
            animation: registerCorePulse 5.5s ease-in-out infinite;
          }

          .register-orbit {
            animation: registerOrbit 28s linear infinite;
          }

          .register-reverse-orbit {
            animation: registerReverseOrbit 36s linear infinite;
          }

          .register-node-pulse {
            animation: registerNodePulse 4s ease-in-out infinite;
          }

          .register-path-flow {
            stroke-dasharray: 10 16;
            animation: registerPathFlow 5.5s ease-in-out infinite;
          }

          .register-float {
            animation: registerFloat 7s ease-in-out infinite;
          }

          .register-signal {
            animation: registerSignal 3.8s ease-out infinite;
          }
        `}
      </style>

      <div className="register-grid absolute inset-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(24,24,27,0.085),transparent_42%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.96),rgba(250,250,250,0.84))]" />

      <svg
        className="pointer-events-none absolute h-full w-full"
        viewBox="0 0 1000 800"
        fill="none"
        aria-hidden="true"
      >
        <path
          className="register-path-flow"
          d="M210 230 C330 170, 420 250, 500 360"
          stroke="rgb(82 82 91)"
          strokeWidth="1"
        />
        <path
          className="register-path-flow"
          d="M500 360 C620 270, 720 290, 805 190"
          stroke="rgb(113 113 122)"
          strokeWidth="1"
          style={{ animationDelay: '0.8s' }}
        />
        <path
          className="register-path-flow"
          d="M230 540 C350 640, 470 580, 500 360"
          stroke="rgb(161 161 170)"
          strokeWidth="1"
          style={{ animationDelay: '1.4s' }}
        />
        <path
          className="register-path-flow"
          d="M500 360 C610 500, 720 560, 820 470"
          stroke="rgb(82 82 91)"
          strokeWidth="1"
          style={{ animationDelay: '2s' }}
        />
      </svg>

      <div className="pointer-events-none absolute inset-0">
        {connectionNodes.map((node) => (
          <span
            key={`${node.left}-${node.top}`}
            className="register-node-pulse absolute h-2 w-2 rounded-full bg-zinc-900"
            style={
              {
                left: node.left,
                top: node.top,
                animationDelay: node.delay,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <div className="register-float relative flex h-[430px] w-[430px] items-center justify-center">
        <div className="register-signal absolute h-[300px] w-[300px] rounded-full border border-zinc-300/70" />
        <div
          className="register-signal absolute h-[360px] w-[360px] rounded-full border border-zinc-300/45"
          style={{ animationDelay: '0.9s' }}
        />
        <div
          className="register-signal absolute h-[420px] w-[420px] rounded-full border border-zinc-300/30"
          style={{ animationDelay: '1.8s' }}
        />

        <div className="register-orbit absolute h-[360px] w-[360px] rounded-full border border-dashed border-zinc-300/80" />
        <div className="register-reverse-orbit absolute h-[290px] w-[290px] rounded-full border border-dashed border-zinc-300/60" />

        <div className="register-core-pulse relative flex h-[210px] w-[210px] items-center justify-center rounded-full border border-zinc-300 bg-white shadow-[0_30px_90px_-55px_rgba(0,0,0,0.45)]">
          <div className="absolute h-[170px] w-[170px] rounded-full border border-zinc-300/70" />
          <div className="absolute h-[120px] w-[120px] rounded-full border border-zinc-300/50" />
          <div className="absolute h-[72px] w-[72px] rounded-full border border-zinc-300/40" />

          <svg
            className="absolute h-[190px] w-[190px]"
            viewBox="0 0 220 220"
            fill="none"
            aria-hidden="true"
          >
            <path
              className="register-path-flow"
              d="M40 112 C70 58, 150 58, 180 112"
              stroke="rgb(24 24 27)"
              strokeWidth="1.2"
            />
            <path
              className="register-path-flow"
              d="M40 112 C72 165, 148 165, 180 112"
              stroke="rgb(24 24 27)"
              strokeWidth="1.2"
              style={{ animationDelay: '1.1s' }}
            />

            <circle cx="40" cy="112" r="4" fill="rgb(24 24 27)" />
            <circle cx="110" cy="62" r="4" fill="rgb(24 24 27)" />
            <circle cx="180" cy="112" r="4" fill="rgb(24 24 27)" />
            <circle cx="110" cy="160" r="4" fill="rgb(24 24 27)" />
          </svg>

          <div className="h-3 w-3 rounded-full bg-zinc-950 shadow-[0_0_28px_rgba(24,24,27,0.45)]" />
        </div>

        <div className="register-orbit absolute h-[330px] w-[330px] rounded-full">
          <div className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-zinc-950" />
          <div className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-zinc-700" />
        </div>
      </div>

      <div className="absolute bottom-10 left-10 max-w-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-zinc-400">CRM AI</p>

        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-950">
          Conecte sua equipe ao primeiro ponto da rede.
        </h2>

        <p className="mt-4 text-sm leading-6 text-zinc-500">
          Crie sua organização, inicie o fluxo comercial e prepare o ambiente para acompanhar cada
          oportunidade.
        </p>
      </div>
    </div>
  );
}

export function RegisterPage() {
  return (
    <AuthLayout
      title="Criar conta"
      description="Conecte sua organização e comece seu fluxo de trabalho."
      footer={<RegisterFooter />}
      visual={<RegisterVisual />}
    >
      <RegisterForm />
    </AuthLayout>
  );
}
