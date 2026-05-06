'use client';

import ThemeToggle from '@/components/theme-toggle';

interface Props {
  djName: string | null;
  djInstagram: string | null;
}

export default function SessionEnded({ djName, djInstagram }: Props) {
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
        <h1 style={{ fontSize: '1.5rem', fontWeight: 500, letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
          {djName ? `${djName} no está pinchando ahora` : 'Sesión no disponible'}
        </h1>
        <p style={{ color: 'var(--fg-subtle)', fontSize: '0.9375rem', lineHeight: 1.5, marginBottom: djInstagram ? '1.5rem' : 0 }}>
          {djName ? 'Vuelve a escanear el código cuando empiece la próxima sesión.' : 'Esta sesión ya no está disponible.'}
        </p>
        {djInstagram && (
          <a href={`https://instagram.com/${djInstagram}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'var(--accent)', color: 'var(--accent-fg)', padding: '0.75rem 1.5rem', borderRadius: '10px', fontSize: '0.9375rem', fontWeight: 500, textDecoration: 'none' }}>
            Seguir a @{djInstagram}
          </a>
        )}
      </div>
    </main>
  );
}
