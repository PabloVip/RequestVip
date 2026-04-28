'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-browser';
import ThemeToggle from '@/components/theme-toggle';

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
      maxWidth: '520px',
      margin: '0 auto',
      padding: '2rem 1.5rem',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
      }}>
        <Link href="/admin" style={{
          color: 'var(--fg-subtle)',
          fontSize: '0.875rem',
          textDecoration: 'none',
        }}>
          ← Volver
        </Link>
        <ThemeToggle />
      </div>

      <h1 style={{
        fontSize: '1.75rem',
        fontWeight: 500,
        letterSpacing: '-0.025em',
        marginBottom: '0.5rem',
      }}>
        Perfil
      </h1>
      <p style={{
        color: 'var(--fg-subtle)',
        fontSize: '0.9375rem',
        marginBottom: '2rem',
      }}>
        Estos datos se mostrarán a los asistentes en tu QR.
      </p>

      <form onSubmit={handleSave}>
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={labelStyle}>Nombre artístico</label>
          <input type="text" required value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <label style={labelStyle}>Instagram</label>
          <input type="text" required value={igUsername} onChange={(e) => setIgUsername(e.target.value)} placeholder="@tu_usuario" />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>Slug</label>
          <input type="text" value={slug} disabled style={{ opacity: 0.6 }} />
        </div>

        {error && (
          <div style={{
            background: 'var(--danger-bg)',
            color: 'var(--danger-fg)',
            border: '0.5px solid var(--danger-border)',
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
            background: 'var(--accent-soft)',
            color: 'var(--accent-soft-fg)',
            border: '0.5px solid var(--accent-border)',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '0.875rem',
          }}>
            Perfil actualizado
          </div>
        )}

        <button type="submit" disabled={saving} style={{
          width: '100%',
          background: 'var(--accent)',
          color: 'var(--accent-fg)',
          border: 'none',
          padding: '0.875rem',
          borderRadius: '8px',
          fontSize: '0.9375rem',
          fontWeight: 500,
        }}>
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
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
