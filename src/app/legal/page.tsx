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

      <Section title="Responsable del tratamiento">
        <p>
          En cumplimiento del Reglamento (UE) 2016/679 General de Protección de Datos (RGPD) y la Ley Orgánica 3/2018 de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD), se informa:
        </p>
        <ul>
          <li><strong>Responsable:</strong> Pablo Vicente Juan</li>
          <li><strong>Email de contacto:</strong> <a href="mailto:pablov.j.vj@gmail.com" style={linkStyle}>pablov.j.vj@gmail.com</a></li>
          <li><strong>Ámbito territorial:</strong> España</li>
          <li><strong>Servicio:</strong> TuneVIP — sistema de peticiones musicales para eventos</li>
        </ul>
      </Section>

      <Section title="Política de privacidad">
        <p>
          TuneVIP recoge y trata únicamente los datos estrictamente necesarios para prestar el servicio:
        </p>
        <ul>
          <li><strong>DJs registrados:</strong> email, nombre artístico y usuario de Instagram. Se usan para autenticación e identificación dentro del servicio.</li>
          <li><strong>Asistentes (usuarios anónimos):</strong> se genera un identificador anónimo almacenado en una cookie. No se recogen datos personales identificables como nombre, email o teléfono.</li>
          <li><strong>Peticiones de canciones:</strong> título, artista y momento de la petición, vinculados al identificador anónimo del asistente.</li>
        </ul>
        <p><strong>Base legal del tratamiento:</strong> ejecución del servicio solicitado (art. 6.1.b RGPD) e interés legítimo en el correcto funcionamiento de la plataforma (art. 6.1.f RGPD).</p>
        <p><strong>Plazo de conservación:</strong> los datos de DJs se conservan mientras la cuenta esté activa. Los datos de peticiones se conservan durante 12 meses desde la celebración del evento. Los identificadores anónimos de asistentes expiran a los 30 días.</p>
        <p><strong>Transferencias internacionales:</strong> los datos se almacenan en servidores de Supabase (Frankfurt, UE) y la aplicación se sirve desde Vercel, empresa estadounidense adherida al marco EU-US Data Privacy Framework. Ambos proveedores ofrecen garantías adecuadas conforme al RGPD.</p>
        <p>No cedemos datos a terceros con fines comerciales ni publicitarios.</p>
      </Section>

      <Section title="Derechos de los usuarios">
        <p>
          Cualquier persona cuyos datos sean tratados por TuneVIP puede ejercer los siguientes derechos:
        </p>
        <ul>
          <li><strong>Acceso:</strong> conocer qué datos personales se tratan.</li>
          <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos.</li>
          <li><strong>Supresión (derecho al olvido):</strong> solicitar la eliminación de los datos cuando ya no sean necesarios.</li>
          <li><strong>Oposición:</strong> oponerse al tratamiento de los datos en determinadas circunstancias.</li>
          <li><strong>Limitación:</strong> solicitar la restricción del tratamiento en ciertos supuestos.</li>
          <li><strong>Portabilidad:</strong> recibir los datos en formato estructurado y legible por máquina.</li>
        </ul>
        <p>
          Para ejercer cualquiera de estos derechos, envía un email a <a href="mailto:pablov.j.vj@gmail.com" style={linkStyle}>pablov.j.vj@gmail.com</a> indicando el derecho que deseas ejercer. Responderemos en el plazo máximo de 30 días. Si consideras que el tratamiento no es conforme a la normativa, puedes presentar una reclamación ante la <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" style={linkStyle}>Agencia Española de Protección de Datos (AEPD)</a>.
        </p>
      </Section>

      <Section title="Términos de uso">
        <p>
          Al usar TuneVIP aceptas las siguientes condiciones:
        </p>
        <ul>
          <li>No utilizar el servicio para fines ilegales o que vulneren derechos de terceros.</li>
          <li>No realizar peticiones automatizadas, spam o intentos de saturar el sistema.</li>
          <li>Respetar las decisiones del DJ sobre qué peticiones acepta o rechaza.</li>
          <li>El servicio se proporciona &quot;tal cual&quot;, sin garantías de disponibilidad ininterrumpida.</li>
          <li>El responsable se reserva el derecho de suspender cuentas que incumplan estas condiciones.</li>
        </ul>
        <p>
          Los DJs son responsables del contenido y la configuración de sus propias sesiones. TuneVIP actúa como plataforma intermediaria y no se hace responsable del contenido específico de las peticiones musicales recibidas.
        </p>
        <p>
          Estos términos se rigen por la legislación española. Para cualquier controversia derivada del uso del servicio, las partes se someten a los juzgados y tribunales competentes conforme a la normativa aplicable.
        </p>
      </Section>

      <Section title="Cookies">
        <p>
          TuneVIP utiliza únicamente cookies estrictamente necesarias para el funcionamiento del servicio. No se usan cookies de terceros, analítica ni publicidad.
        </p>
        <ul>
          <li><code>attendee_id</code>: identificador anónimo del asistente. Duración: 30 días.</li>
          <li>Cookies de sesión de Supabase Auth: mantienen la sesión del DJ autenticado. Duración: sesión activa.</li>
        </ul>
        <p>
          Al tratarse de cookies estrictamente necesarias, no requieren consentimiento previo conforme a la Ley 34/2002 de Servicios de la Sociedad de la Información (LSSI).
        </p>
      </Section>

      <Section title="Atribuciones">
        <p>
          TuneVIP utiliza los siguientes servicios externos:
        </p>
        <ul>
          <li>Catálogo musical: <a href="https://www.deezer.com/" target="_blank" rel="noopener noreferrer" style={linkStyle}>Deezer</a></li>
          <li>Datos de BPM y clave musical: <a href="https://getsongbpm.com" target="_blank" rel="noopener noreferrer" style={linkStyle}>GetSongBPM</a></li>
          <li>Base de datos y autenticación: <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" style={linkStyle}>Supabase</a></li>
          <li>Infraestructura de despliegue: <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" style={linkStyle}>Vercel</a></li>
          <li>Tipografía: <a href="https://vercel.com/font" target="_blank" rel="noopener noreferrer" style={linkStyle}>Geist</a></li>
        </ul>
      </Section>

      <Section title="Contacto">
        <p>
          Para cualquier consulta sobre privacidad, ejercicio de derechos o términos de uso:
        </p>
        <ul>
          <li><strong>Responsable:</strong> Pablo Vicente Juan</li>
          <li><strong>Email:</strong> <a href="mailto:pablov.j.vj@gmail.com" style={linkStyle}>pablov.j.vj@gmail.com</a></li>
        </ul>
      </Section>

      <style>{`
        section ul { padding-left: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; margin: 0; }
        section li { color: var(--fg-muted); }
        section code { font-family: var(--font-mono, monospace); font-size: 0.875rem; background: var(--bg-muted); padding: 0.125rem 0.375rem; border-radius: 4px; }
      `}</style>
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
    </section>
  );
}
