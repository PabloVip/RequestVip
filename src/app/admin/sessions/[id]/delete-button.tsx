'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteButton({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!confirm('¿Borrar esta sesión? Se eliminarán también todas sus peticiones. Esta acción no se puede deshacer.')) {
      return;
    }

    setDeleting(true);
    setError(null);

    const res = await fetch(`/api/sessions/${sessionId}/delete`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'Error al borrar');
      setDeleting(false);
      return;
    }

    router.push('/admin/sessions');
    router.refresh();
  };

  return (
    <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '0.5px solid var(--border-subtle)' }}>
      <button
        onClick={handleDelete}
        disabled={deleting}
        style={{
          width: '100%',
          background: 'transparent',
          color: 'var(--danger-fg)',
          border: '0.5px solid var(--danger-border)',
          padding: '0.875rem',
          borderRadius: '8px',
          fontSize: '0.875rem',
          fontWeight: 500,
        }}
      >
        {deleting ? 'Borrando...' : 'Borrar esta sesión'}
      </button>
      {error && (
        <p style={{ color: 'var(--danger-fg)', fontSize: '0.8125rem', textAlign: 'center', marginTop: '0.5rem' }}>
          {error}
        </p>
      )}
    </div>
  );
}
