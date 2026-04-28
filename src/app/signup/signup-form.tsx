'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-browser';

export default function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [igUsername, setIgUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          ig_username: igUsername.replace('@', '').trim(),
        },
      },
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
          Crear cuenta
        </h1>
        <p style={{
          color: '#888',
          textAlign: 'center',
          marginBottom: '2rem',
        }}>
          Empieza a recibir peticiones
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.875rem', color: '#aaa', display: 'block', marginBottom: '0.5rem' }}>
              Nombre artístico
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="DJ Marco Vega"
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

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.875rem', color: '#aaa', display: 'block', marginBottom: '0.5rem' }}>
              Instagram
            </label>
            <input
              type="text"
              required
              value={igUsername}
              onChange={(e) => setIgUsername(e.target.value)}
              placeholder="@tu_usuario"
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
              minLength={6}
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
            <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
              Mínimo 6 caracteres
            </p>
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
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#888', fontSize: '0.875rem' }}>
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" style={{ color: '#fff', textDecoration: 'underline' }}>
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
