'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface Props {
  url: string;
  djName: string;
  djInstagram: string;
  venue: string | null;
}

export default function QRView({ url, djName, djInstagram, venue }: Props) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    QRCode.toDataURL(url, {
      width: 600,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
      errorCorrectionLevel: 'H',
    }).then(setDataUrl);
  }, [url]);

  return (
    <main style={{
      minHeight: '100vh',
      background: '#fff',
      color: '#000',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <p style={{
        fontSize: '0.875rem',
        textTransform: 'uppercase',
        letterSpacing: '0.15em',
        color: '#666',
        marginBottom: '0.5rem',
      }}>
        {venue ?? 'En vivo'}
      </p>

      <h1 style={{
        fontSize: '3rem',
        fontWeight: 700,
        marginBottom: '0.25rem',
      }}>
        {djName}
      </h1>

      <p style={{ color: '#666', marginBottom: '2.5rem' }}>
        @{djInstagram}
      </p>

      {dataUrl && (
        <img
          src={dataUrl}
          alt="QR para pedir canciones"
          style={{
            width: '320px',
            height: '320px',
            marginBottom: '1.5rem',
          }}
        />
      )}

      <p style={{
        fontSize: '1.5rem',
        fontWeight: 500,
        marginBottom: '0.5rem',
      }}>
        Escanea para pedir canciones
      </p>

      <p style={{
        fontSize: '0.9375rem',
        color: '#666',
      }}>
        Sigue al DJ en Instagram y pide la que quieras
      </p>
    </main>
  );
}
