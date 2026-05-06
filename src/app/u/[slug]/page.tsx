import { redirect } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase-server';
import NoSession from './no-session';

export default async function DjSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createServiceClient();

  const { data: dj } = await supabase
    .from('djs')
    .select('id, display_name, ig_username')
    .eq('slug', slug)
    .single();

  if (!dj) {
    return <NoSession djName={null} />;
  }

  const { data: activeSession } = await supabase
    .from('sessions')
    .select('id')
    .eq('dj_id', dj.id)
    .eq('status', 'active')
    .maybeSingle();

  if (activeSession) {
    redirect(`/s/${activeSession.id}`);
  }

  return <NoSession djName={dj.display_name} djInstagram={dj.ig_username} />;
}
