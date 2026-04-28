'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-browser';
import ThemeToggle from '@/components/theme-toggle';

interface Preferences {
  blacklistTerms: string[];
  defaultRejectionMsg: string;
  cooldownSeconds: number;
  maxRequestsPerUser: number;
  rejectExplicit: boolean;
  welcomeMessage: string;
  autoRejectBlacklist: boolean;
}

interface Props {
  djId: string;
  initial: Preferences;
}

export default function PreferencesForm({ djId, initial }: Props) {
  const router = useRouter();
  const [prefs, setPrefs] = useState<Preferences>(initial);
  const [newTerm, setNewTerm] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addTerm = () => {
    const term = newTerm.trim().toLowerCase();
    if (!term) return;
    if (prefs.blacklistTerms.includes(term)) {
      setNewTerm('');
      return;
    }
    setPrefs({ ...prefs, blacklistTerms: [...prefs.blacklistTerms, term] });
    setNewTerm('');
  };

  const removeTerm = (term: string) => {
    setPrefs({ ...prefs, blacklistTerms: prefs.blacklistTerms.filter(t => t !== term) });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    setSuccess(false);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from('dj_preferences')
      .update({
        blacklist_terms: prefs.blacklistTerms,
        default_rejection_msg: prefs.defaultRejectionMsg.trim() || null,
        cooldown_seconds: prefs.cooldownSeconds,
        max_requests_per_user: prefs.maxRequestsPerUser,
        reject_explicit: prefs.rejectExplicit,
        welcome_message: prefs.welcomeMessage.trim() || null,
        auto_reject_blacklist: prefs.autoRejectBlacklist,
        updated_at: new Date().toISOString(),
      })
      .eq('dj_id', djId);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    setSuccess(true);
    setSaving(false);
    router.refresh();
    setTimeout(() => setSuccess(false), 2500);
  };

  return (
    <main style={{
      minHeight: '100vh',
      maxWidth: '600px',
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
        Preferencias
      </h1>
      <p style={{
        color: 'var(--fg-subtle)',
        fontSize: '0.9375rem',
        marginBottom: '2rem',
      }}>
        Controla qué peticiones aceptas y cómo se comporta tu app.
      </p>

      <form onSubmit={handleSave}>

        <Section title="Blacklist" subtitle="Artistas o palabras que se rechazan automáticamente.">
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <input
              type="text"
              placeholder="ej. reggaeton, Bad Bunny..."
              value={newTerm}
              onChange={(e) => setNewTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTerm();
                }
              }}
              style={{ flex: 1 }}
            />
            <button
              type="button"
              onClick={addTerm}
              style={{
                background: 'var(--bg-muted)',
                color: 'var(--fg)',
                border: '0.5px solid var(--border)',
                padding: '0 1rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              Añadir
            </button>
          </div>

          {prefs.blacklistTerms.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.75rem' }}>
              {prefs.blacklistTerms.map(term => (
                <span
                  key={term}
                  style={{
                    background: 'var(--danger-bg)',
                    color: 'var(--danger-fg)',
                    border: '0.5px solid var(--danger-border)',
                    padding: '0.375rem 0.75rem',
                    borderRadius: '999px',
                    fontSize: '0.8125rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  {term}
                  <button
                    type="button"
                    onClick={() => removeTerm(term)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--danger-fg)',
                      fontSize: '1rem',
                      lineHeight: 1,
                      padding: 0,
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          <Toggle
            label="Rechazar automáticamente las que coincidan"
            checked={prefs.autoRejectBlacklist}
            onChange={(v) => setPrefs({ ...prefs, autoRejectBlacklist: v })}
          />
        </Section>

        <Section title="Filtro de contenido">
          <Toggle
            label="Rechazar canciones explícitas"
            checked={prefs.rejectExplicit}
            onChange={(v) => setPrefs({ ...prefs, rejectExplicit: v })}
          />
        </Section>

        <Section title="Mensajes">
          <label style={labelStyle}>Mensaje de bienvenida (opcional)</label>
          <textarea
            value={prefs.welcomeMessage}
            onChange={(e) => setPrefs({ ...prefs, welcomeMessage: e.target.value })}
            placeholder="ej. Esta noche techno y deep house"
            maxLength={120}
            rows={2}
            style={{ marginBottom: '1rem', resize: 'vertical' }}
          />

          <label style={labelStyle}>Mensaje de rechazo por defecto</label>
          <textarea
            value={prefs.defaultRejectionMsg}
            onChange={(e) => setPrefs({ ...prefs, defaultRejectionMsg: e.target.value })}
            placeholder="ej. No encaja con el set de hoy"
            maxLength={120}
            rows={2}
            style={{ resize: 'vertical' }}
          />
        </Section>

        <Section title="Límites por usuario">
          <label style={labelStyle}>
            Espera entre peticiones: <strong style={{ color: 'var(--fg)' }}>{Math.round(prefs.cooldownSeconds / 60)} min</strong>
          </label>
          <input
            type="range"
            min={60}
            max={1800}
            step={60}
            value={prefs.cooldownSeconds}
            onChange={(e) => setPrefs({ ...prefs, cooldownSeconds: Number(e.target.value) })}
            style={{ width: '100%', marginBottom: '1rem', accentColor: 'var(--accent)' }}
          />

          <label style={labelStyle}>
            Máximo de peticiones por sesión: <strong style={{ color: 'var(--fg)' }}>{prefs.maxRequestsPerUser}</strong>
          </label>
          <input
            type="range"
            min={1}
            max={20}
            step={1}
            value={prefs.maxRequestsPerUser}
            onChange={(e) => setPrefs({ ...prefs, maxRequestsPerUser: Number(e.target.value) })}
            style={{ width: '100%', accentColor: 'var(--accent)' }}
          />
        </Section>

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
            Preferencias guardadas
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

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section style={{
      background: 'var(--bg-subtle)',
      border: '0.5px solid var(--border-subtle)',
      padding: '1.25rem',
      borderRadius: '12px',
      marginBottom: '1rem',
    }}>
      <h2 style={{
        fontSize: '1rem',
        fontWeight: 500,
        marginBottom: subtitle ? '0.25rem' : '0.875rem',
        letterSpacing: '-0.01em',
      }}>
        {title}
      </h2>
      {subtitle && (
        <p style={{
          color: 'var(--fg-subtle)',
          fontSize: '0.8125rem',
          marginBottom: '1rem',
        }}>
          {subtitle}
        </p>
      )}
      {children}
    </section>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      cursor: 'pointer',
      fontSize: '0.9375rem',
    }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{
          width: '20px',
          height: '20px',
          accentColor: 'var(--accent)',
          cursor: 'pointer',
        }}
      />
      {label}
    </label>
  );
}
