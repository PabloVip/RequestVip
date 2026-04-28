export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>TuneDrop</h1>
      <p style={{ color: '#888', marginBottom: '2rem' }}>
        Pide canciones al DJ escaneando su QR
      </p>
      <p style={{ fontSize: '0.875rem', color: '#666' }}>
        Para entrar a una sesión: <code>/s/[sessionId]</code>
      </p>
      <p style={{ fontSize: '0.875rem', color: '#666' }}>
        Dashboard del DJ: <code>/dj/[sessionId]</code>
      </p>
    </main>
  );
}
