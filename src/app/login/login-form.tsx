'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-browser';

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
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 600,
          marginBottom: '0.5rem',
          textAlign: 'center',
        }}>
          TuneDrop
        </h1>
        <p style={{
          color: '#888',
          textAlign: 'center',
          marginBottom: '2rem',
        }}>
          Inicia sesión como DJ
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.875rem', color: '#aaa', display: 'block', marginBottom: '0.5rem' }}>
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                background: '#1a1a1a',
                color: '#fff',
                border: '1px solid #333',
                padding: '0.875rem 1rem',
                borderRadius: '8px',
                fontSize: '1rem',
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.875rem', color: '#aaa', display: 'block', marginBottom: '0.5rem' }}>
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                background: '#1a1a1a',
                color: '#fff',
                border: '1px solid #333',
                padding: '0.875rem 1rem',
                borderRadius: '8px',
                fontSize: '1rem',
              }}
            />
          </div>

          {error && (
            <div style={{
              background: '#3a0a0a',
              color: '#f87171',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.875rem',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: '#fff',
              color: '#000',
              border: 'none',
              padding: '1rem',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 500,
              marginBottom: '1rem',
            }}
          >
            {loading ? 'Entrando...' : 'Iniciar sesión'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#888', fontSize: '0.875rem' }}>
          ¿No tienes cuenta?{' '}
          <Link href="/signup" style={{ color: '#fff', textDecoration: 'underline' }}>
            Regístrate
          </Link>
        </p>
      </div>
    </main>
  );
}
