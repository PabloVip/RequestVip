import { redirect } from 'next/navigation';
import { createUserClient, createServiceClient } from '@/lib/supabase-server';
import AdminClient from './admin-client';

export default async function AdminPage() {
  const supabase = await createUserClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const service = createServiceClient();

  const { data: dj } = await service
    .from('djs')
    .select('id, display_name, slug, ig_username')
    .eq('user_id', user.id)
    .single();

  if (!dj) {
    return (
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Error cargando perfil. Contacta soporte.</p>
      </main>
    );
  }

  const { data: activeSession } = await service
    .from('sessions')
    .select('id, venue, qr_token, accepting, started_at')
    .eq('dj_id', dj.id)
    .eq('status', 'active')
    .maybeSingle();

  let stats = null;
  if (activeSession) {
    const { data: requests } = await service
      .from('song_requests')
      .select('status')
      .eq('session_id', activeSession.id);

    if (requests) {
      stats = {
        pending: requests.filter(r => r.status === 'pending').length,
        accepted: requests.filter(r => r.status === 'accepted').length,
        played: requests.filter(r => r.status === 'played').length,
        total: requests.length,
      };
    }
  }

  const { count: totalSessions } = await service
    .from('sessions')
    .select('id', { count: 'exact', head: true })
    .eq('dj_id', dj.id);

  const { data: allSessions } = await service
    .from('sessions')
    .select('id')
    .eq('dj_id', dj.id);

  let totalRequests = 0;
  let acceptedRequests = 0;
  if (allSessions && allSessions.length > 0) {
    const sessionIds = allSessions.map(s => s.id);
    const { data: allReqs } = await service
      .from('song_requests')
      .select('status')
      .in('session_id', sessionIds);
    if (allReqs) {
      totalRequests = allReqs.length;
      acceptedRequests = allReqs.filter(r => r.status === 'accepted' || r.status === 'played').length;
    }
  }

  const acceptanceRate = totalRequests > 0
    ? Math.round((acceptedRequests / totalRequests) * 100)
    : null;

  return (
    <AdminClient
      djName={dj.display_name}
      djInstagram={dj.ig_username}
      activeSession={activeSession}
      stats={stats}
      userEmail={user.email ?? ''}
      globalStats={{
        totalSessions: totalSessions ?? 0,
        totalRequests,
        acceptanceRate,
      }}
    />
  );
}
