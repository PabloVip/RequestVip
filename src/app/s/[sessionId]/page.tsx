import { createServiceClient } from '@/lib/supabase-server';
import AttendeeApp from './attendee-app';
import SessionEnded from './session-ended';

export default async function SessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const supabase = createServiceClient();

  const { data: session } = await supabase
    .from('sessions')
    .select('id, venue, status, accepting, dj_id, ig_post_code, djs(display_name, ig_username, slug)')
    .eq('id', sessionId)
    .single();

  if (!session) {
    return <SessionEnded djName={null} djSlug={null} />;
  }

  const dj = session.djs as unknown as {
    display_name: string;
    ig_username: string;
    slug: string;
  } | null;

  if (!dj) {
    return <SessionEnded djName={null} djSlug={null} />;
  }

  if (session.status !== 'active') {
    return <SessionEnded djName={dj.display_name} djSlug={dj.slug} />;
  }

  return (
    <AttendeeApp
      sessionId={session.id}
      djId={session.dj_id}
      djName={dj.display_name}
      djInstagram={dj.ig_username}
      venue={session.venue}
      accepting={session.accepting}
      igPostCode={session.ig_post_code}
    />
  );
}
