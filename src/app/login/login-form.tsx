'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-browser';
import ThemeToggle from '@/components/theme-toggle';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push('/admin');
    router.refresh();
  };

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      position: 'relative',
    }}>
      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
        <ThemeToggle />
      </div>

      <div style={{ width: '100%', maxWidth: '380px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 500,
            letterSpacing: '-0.02em',
            marginBottom: '0.5rem',
          }}>
            TuneDrop
          </h1>
          <p style={{ color: 'var(--fg-subtle)', fontSize: '0.9375rem' }}>
            Inicia sesión como DJ
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div style={errorBoxStyle}>{error}</div>
          )}

          <button type="submit" disabled={loading} style={primaryButtonStyle}>
            {loading ? 'Entrando...' : 'Iniciar sesión'}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          color: 'var(--fg-subtle)',
          fontSize: '0.875rem',
          marginTop: '1.5rem',
        }}>
          ¿No tienes cuenta?{' '}
          <Link href="/signup" style={{
            color: 'var(--accent-soft-fg)',
            textDecoration: 'none',
            fontWeight: 500,
          }}>
            Regístrate
          </Link>
        </p>
      </div>
    </main>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: '0.8125rem',
  color: 'var(--fg-subtle)',
  display: 'block',
  marginBottom: '0.5rem',
  fontWeight: 500,
};

const errorBoxStyle: React.CSSProperties = {
  background: 'var(--danger-bg)',
  color: 'var(--danger-fg)',
  border: '0.5px solid var(--danger-border)',
  padding: '0.75rem 1rem',
  borderRadius: '8px',
  marginBottom: '1rem',
  fontSize: '0.875rem',
};

const primaryButtonStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--accent)',
  color: 'var(--accent-fg)',
  border: 'none',
  padding: '0.875rem',
  borderRadius: '8px',
  fontSize: '0.9375rem',
  fontWeight: 500,
};
