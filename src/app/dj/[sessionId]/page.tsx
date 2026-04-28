import { notFound } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase-server';
import DjDashboard from './dj-dashboard';

export default async function DjPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const supabase = createServiceClient();

  const { data: session } = await supabase
    .from('sessions')
    .select('id, venue, status, accepting, dj_id, djs(display_name, ig_username)')
    .eq('id', sessionId)
    .single();

  if (!session) notFound();

  const dj = session.djs as unknown as {
    display_name: string;
    ig_username: string;
  } | null;

  if (!dj) notFound();

  return (
    <DjDashboard
      sessionId={session.id}
      djName={dj.display_name}
      venue={session.venue}
      initialAccepting={session.accepting}
    />
  );
}
