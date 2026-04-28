'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-browser';

interface Props {
  djId: string;
  initialName: string;
  initialInstagram: string;
  slug: string;
}

export default function ProfileForm({ djId, initialName, initialInstagram, slug }: Props) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialName);
  const [igUsername, setIgUsername] = useState(initialInstagram);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    setSuccess(false);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from('djs')
      .update({
        display_name: displayName.trim(),
        ig_username: igUsername.replace('@', '').trim(),
      })
      .eq('id', djId);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    setSuccess(true);
    setSaving(false);
    router.refresh();
    setTimeout(() => setSuccess(false), 2000);
  };

  return (
    <main style={{
      minHeight: '100vh',
      maxWidth: '500px',
      margin: '0 auto',
      padding: '1.5rem',
    }}>
      <Link
        href="/admin"
        style={{ color: '#888', fontSize: '0.875rem', textDecoration: 'none', marginBottom: '1.5rem', display: 'inline-block' }}
      >
        ← Volver
      </Link>

      <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>
        Perfil
      </h1>
      <p style={{ color: '#888', fontSize: '0.9375rem', marginBottom: '2rem' }}>
        Estos datos se mostrarán a los asistentes en tu QR.
      </p>

      <form onSubmit={handleSave}>
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ fontSize: '0.875rem', color: '#aaa', display: 'block', marginBottom: '0.5rem' }}>
            Nombre artístico
          </label>
          <input
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            style={{
              width: '100%',
              background: '#1a1a1a',
              color: '#fff',
              border: '1px solid #333',
              padding: '0.875rem 1rem',
              borderRadius: '8px',
              fontSize: '1rem',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
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
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '0.875rem', color: '#aaa', display: 'block', marginBottom: '0.5rem' }}>
            Slug (no editable)
          </label>
          <input
            type="text"
            value={slug}
            disabled
            style={{
              width: '100%',
              background: '#0a0a0a',
              color: '#666',
              border: '1px solid #222',
              padding: '0.875rem 1rem',
              borderRadius: '8px',
              fontSize: '1rem',
              boxSizing: 'border-box',
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

        {success && (
          <div style={{
            background: '#0a3320',
            color: '#34d399',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '0.875rem',
          }}>
            Perfil actualizado
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          style={{
            width: '100%',
            background: '#fff',
            color: '#000',
            border: 'none',
            padding: '1rem',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 500,
          }}
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </main>
  );
}
