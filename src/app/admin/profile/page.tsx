import { redirect } from 'next/navigation';
import { createUserClient, createServiceClient } from '@/lib/supabase-server';
import ProfileForm from './profile-form';

export default async function ProfilePage() {
  const supabase = await createUserClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const service = createServiceClient();
  const { data: dj } = await service
    .from('djs')
    .select('id, display_name, ig_username, slug')
    .eq('user_id', user.id)
    .single();

  if (!dj) redirect('/admin');

  return (
    <ProfileForm
      djId={dj.id}
      initialName={dj.display_name}
      initialInstagram={dj.ig_username}
      slug={dj.slug}
    />
  );
}
