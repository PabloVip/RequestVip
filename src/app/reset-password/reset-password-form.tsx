'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import ThemeToggle from '@/components/theme-toggle';

export default function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
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
            Nueva contraseña
          </h1>
          <p style={{ color: 'var(--fg-subtle)', fontSize: '0.9375rem' }}>
            Crea una contraseña nueva para tu cuenta
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Contraseña nueva</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={6}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Confirma la contraseña</label>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              minLength={6}
            />
          </div>

          {error && (
            <div style={errorBoxStyle}>{error}</div>
          )}

          <button type="submit" disabled={loading} style={primaryButtonStyle}>
            {loading ? 'Guardando...' : 'Guardar contraseña'}
          </button>
        </form>
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
