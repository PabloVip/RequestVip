'use client';

import Link from 'next/link';
import ThemeToggle from '@/components/theme-toggle';

interface Props {
  djName: string | null;
  djSlug: string | null;
}

export default function SessionEnded({ djName, djSlug }: Props) {
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

        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 500,
          letterSpacing: '-0.02em',
          marginBottom: '0.5rem',
        }}>
          {djName ? `${djName} no está pinchando ahora` : 'Sesión no disponible'}
        </h1>

        <p style={{
          color: 'var(--fg-subtle)',
          fontSize: '0.9375rem',
          lineHeight: 1.5,
          marginBottom: djSlug ? '1.5rem' : 0,
        }}>
          {djName
            ? 'Vuelve a escanear el código cuando empiece la próxima sesión.'
            : 'Esta sesión ya no está disponible.'}
        </p>

        {djSlug && (
          <Link
            href={`/u/${djSlug}`}
            style={{
              display: 'inline-block',
              background: 'var(--accent)',
              color: 'var(--accent-fg)',
              padding: '0.625rem 1.25rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            Ir al perfil del DJ
          </Link>
        )}
      </div>
    </main>
  );
}
