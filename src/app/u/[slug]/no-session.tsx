'use client';

import ThemeToggle from '@/components/theme-toggle';

interface Props {
  djName: string | null;
  djInstagram?: string;
}

export default function NoSession({ djName, djInstagram }: Props) {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.5rem',
      textAlign: 'center',
      position: 'relative',
    }}>
      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
        <ThemeToggle />
      </div>

      <div style={{
        background: 'var(--bg-subtle)',
        border: '0.5px solid var(--border-subtle)',
        borderRadius: '20px',
        padding: '3rem 2rem',
        maxWidth: '420px',
        width: '100%',
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          background: 'var(--bg-muted)',
          borderRadius: '50%',
          margin: '0 auto 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--fg-subtle)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        {djName ? (
          <>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 500,
              letterSpacing: '-0.02em',
              marginBottom: '0.5rem',
            }}>
              {djName} no está pinchando ahora
            </h1>
            {djInstagram && (
              <p style={{
                color: 'var(--fg-subtle)',
                fontSize: '0.9375rem',
                marginBottom: '1.5rem',
              }}>
                @{djInstagram}
              </p>
            )}
            <p style={{
              color: 'var(--fg-subtle)',
              fontSize: '0.9375rem',
              lineHeight: 1.5,
            }}>
              Vuelve a escanear este código cuando empiece la próxima sesión.
            </p>
          </>
        ) : (
          <>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 500,
              letterSpacing: '-0.02em',
              marginBottom: '0.5rem',
            }}>
              DJ no encontrado
            </h1>
            <p style={{
              color: 'var(--fg-subtle)',
              fontSize: '0.9375rem',
              lineHeight: 1.5,
            }}>
              Este enlace no corresponde a ningún DJ registrado.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
