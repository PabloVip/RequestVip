'use client';

import { useEffect, useState } from 'react';
import VerifyStep from './verify-step';
import SearchStep from './search-step';
import StatusStep from './status-step';
import ThemeToggle from '@/components/theme-toggle';

interface Props {
  sessionId: string;
  djId: string;
  djName: string;
  djInstagram: string;
  venue: string | null;
  accepting: boolean;
  igPostCode: string | null;
}

type Stage = 'verify' | 'search' | 'status';

export default function AttendeeApp(props: Props) {
  const [stage, setStage] = useState<Stage>('verify');
  const [requestId, setRequestId] = useState<string | null>(null);

  useEffect(() => {
    const cookies = document.cookie.split(';').map(c => c.trim());
    const hasAttendee = cookies.some(c => c.startsWith('attendee_id='));
    if (hasAttendee) setStage('search');
  }, []);

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      maxWidth: '480px',
      margin: '0 auto',
      padding: '1.5rem',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '1rem',
      }}>
        <ThemeToggle />
      </div>

      <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <p style={{
          fontSize: '0.6875rem',
          color: 'var(--fg-subtle)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          fontWeight: 500,
        }}>
          {props.venue ?? 'En vivo'}
        </p>
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 500,
          marginTop: '0.5rem',
          letterSpacing: '-0.025em',
        }}>
          {props.djName}
        </h1>
        <p style={{
          color: 'var(--fg-subtle)',
          fontSize: '0.875rem',
          marginTop: '0.25rem',
        }}>
          @{props.djInstagram}
        </p>
      </header>

      {!props.accepting && (
        <div style={{
          background: 'var(--warning-bg)',
          color: 'var(--warning-fg)',
          border: '0.5px solid var(--warning-border)',
          padding: '0.75rem 1rem',
          borderRadius: '10px',
          marginBottom: '1.5rem',
          fontSize: '0.875rem',
          textAlign: 'center',
        }}>
          El DJ no está aceptando peticiones ahora mismo
        </div>
      )}

      {stage === 'verify' && (
        <VerifyStep
          sessionId={props.sessionId}
          djInstagram={props.djInstagram}
          igPostCode={props.igPostCode}
          onVerified={() => setStage('search')}
        />
      )}

      {stage === 'search' && props.accepting && (
        <SearchStep
          sessionId={props.sessionId}
          onRequested={(id) => {
            setRequestId(id);
            setStage('status');
          }}
        />
      )}

      {stage === 'status' && requestId && (
        <StatusStep
          requestId={requestId}
          onAnother={() => {
            setRequestId(null);
            setStage('search');
          }}
        />
      )}
    </main>
  );
}
