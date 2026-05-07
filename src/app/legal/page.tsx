import Link from 'next/link';
import ThemeToggle from '@/components/theme-toggle';

export default function LegalPage() {
  return (
    <main style={{
      minHeight: '100vh',
      maxWidth: '720px',
      margin: '0 auto',
      padding: '2rem 1.5rem',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
      }}>
        <Link href="/" style={{
          color: 'var(--fg-subtle)',
          fontSize: '0.875rem',
          textDecoration: 'none',
        }}>
          ← Volver
        </Link>
        <ThemeToggle />
      </div>

      <h1 style={{
        fontSize: '2rem',
        fontWeight: 500,
        letterSpacing: '-0.025em',
        marginBottom: '0.5rem',
      }}>
        Información legal
      </h1>
      <p style={{
        color: 'var(--fg-subtle)',
        fontSize: '0.9375rem',
        marginBottom: '2.5rem',
      }}>
        Última actualización: mayo 2026
      </p>

      <Section title="Política de privacidad">
        <p>
          TuneVIP recopila y trata únicamente los datos necesarios para el funcionamiento del servicio:
        </p>
        <ul>
          <li><strong>DJs registrados</strong>: email, nombre artístico, usuario de Instagram. Estos datos se almacenan en Supabase (UE) y se usan exclusivamente para autenticación e identificación dentro de la app.</li>
          <li><strong>Asistentes (usuarios anónimos)</strong>: se genera un identificador anónimo guardado en una cookie. No se recopilan datos personales identificables (nombre, email, teléfono).</li>
          <li><strong>Peticiones de canciones</strong>: se almacena el título, artista y momento de la petición, asociado al identificador anónimo del asistente.</li>
        </ul>
        <p>
          No compartimos datos con terceros con fines comerciales. Los datos se almacenan en servidores de Supabase (Frankfurt, UE) y la app se sirve desde Vercel. Puedes solicitar la eliminación de tu cuenta enviando un email a la dirección de contacto del DJ administrador.
        </p>
      </Section>

      <Section title="Términos de uso">
        <p>
          Al usar TuneVIP aceptas:
        </p>
        <ul>
          <li>No usar el servicio para fines ilegales o que vulneren derechos de terceros.</li>
          <li>No realizar peticiones automatizadas, spam o intentos de saturar el sistema.</li>
          <li>Respetar las decisiones del DJ sobre qué peticiones acepta o rechaza.</li>
          <li>El servicio se proporciona &quot;tal cual&quot;, sin garantías de disponibilidad ininterrumpida.</li>
        </ul>
        <p>
          Los DJs son responsables de los datos y configuraciones de sus propias sesiones. TuneVIP actúa como plataforma intermedia y no se hace responsable del contenido específico de las peticiones musicales recibidas.
        </p>
      </Section>

      <Section title="Cookies">
        <p>
          TuneVIP usa cookies estrictamente necesarias para el funcionamiento del servicio:
        </p>
        <ul>
          <li><code>attendee_id</code>: identificador anónimo del asistente (30 días).</li>
          <li>Cookies de sesión de Supabase: para mantener la sesión del DJ logueado.</li>
        </ul>
        <p>
          No usamos cookies de terceros, analytics, ni publicidad.
        </p>
      </Section>

      <Section title="Atribuciones">
        <p>
          TuneVIP utiliza los siguientes servicios externos:
        </p>
        <ul>
          <li>
            Catálogo musical: <a href="https://www.deezer.com/" target="_blank" rel="noopener noreferrer" style={linkStyle}>Deezer</a>
          </li>
          <li>
            Datos de BPM y clave musical: <a href="https://getsongbpm.com" target="_blank" rel="noopener noreferrer" style={linkStyle}>GetSongBPM</a>
          </li>
          <li>
            Infraestructura: <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" style={linkStyle}>Supabase</a> y <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" style={linkStyle}>Vercel</a>
          </li>
          <li>
            Tipografía: <a href="https://vercel.com/font" target="_blank" rel="noopener noreferrer" style={linkStyle}>Geist</a>
          </li>
        </ul>
      </Section>

      <Section title="Contacto">
        <p>
          Para consultas sobre privacidad o términos de uso, contacta con el DJ administrador de tu sesión a través de Instagram.
        </p>
      </Section>
    </main>
  );
}

const linkStyle: React.CSSProperties = {
  color: 'var(--accent-soft-fg)',
  textDecoration: 'underline',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{
      marginBottom: '2.5rem',
      lineHeight: 1.7,
      fontSize: '0.9375rem',
      color: 'var(--fg-muted)',
    }}>
      <h2 style={{
        fontSize: '1.25rem',
        fontWeight: 500,
        letterSpacing: '-0.01em',
        marginBottom: '0.875rem',
        color: 'var(--fg)',
      }}>
        {title}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {children}
      </div>
      <style>{`
        section ul { padding-left: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; }
        section li { color: var(--fg-muted); }
        section a { color: var(--accent-soft-fg); }
        section code { font-family: var(--font-mono); font-size: 0.875rem; background: var(--bg-muted); padding: 0.125rem 0.375rem; border-radius: 4px; }
      `}</style>
    </section>
  );
}
