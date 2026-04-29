import { notFound, redirect } from 'next/navigation';
import { createServiceClient, createUserClient } from '@/lib/supabase-server';
import DjDashboard from './dj-dashboard';

export default async function DjPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  const userClient = await createUserClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) redirect('/login');

  const supabase = createServiceClient();

  const { data: dj } = await supabase
    .from('djs')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!dj) redirect('/admin');

  const { data: session } = await supabase
    .from('sessions')
    .select('id, venue, status, accepting, dj_id, djs(display_name, ig_username)')
    .eq('id', sessionId)
    .single();

  if (!session) notFound();

  if (session.dj_id !== dj.id) {
    redirect('/admin');
  }

  const djInfo = session.djs as unknown as {
    display_name: string;
    ig_username: string;
  } | null;

  if (!djInfo) notFound();

  return (
    <DjDashboard
      sessionId={session.id}
      djName={djInfo.display_name}
      venue={session.venue}
      initialAccepting={session.accepting}
    />
  );
}
