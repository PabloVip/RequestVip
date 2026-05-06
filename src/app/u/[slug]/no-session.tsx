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
            <p style={{
              color: 'var(--fg-subtle)',
              fontSize: '0.9375rem',
              lineHeight: 1.5,
              marginBottom: djInstagram ? '1.5rem' : 0,
            }}>
              Vuelve a escanear este código cuando empiece la próxima sesión.
            </p>

            {djInstagram && (
              <a
                href={`https://instagram.com/${djInstagram}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  background: 'var(--accent)',
                  color: 'var(--accent-fg)',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '10px',
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                  textDecoration: 'none',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
                Seguir a @{djInstagram}
              </a>
            )}
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
