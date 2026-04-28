import { redirect } from 'next/navigation';
import { createUserClient, createServiceClient } from '@/lib/supabase-server';
import PreferencesForm from './preferences-form';

export default async function PreferencesPage() {
  const supabase = await createUserClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const service = createServiceClient();

  const { data: dj } = await service
    .from('djs')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!dj) redirect('/admin');

  let { data: prefs } = await service
    .from('dj_preferences')
    .select('*')
    .eq('dj_id', dj.id)
    .single();

  if (!prefs) {
    const { data: created } = await service
      .from('dj_preferences')
      .insert({ dj_id: dj.id })
      .select('*')
      .single();
    prefs = created;
  }

  if (!prefs) redirect('/admin');

  return (
    <PreferencesForm
      djId={dj.id}
      initial={{
        blacklistTerms: prefs.blacklist_terms ?? [],
        defaultRejectionMsg: prefs.default_rejection_msg ?? '',
        cooldownSeconds: prefs.cooldown_seconds ?? 300,
        maxRequestsPerUser: prefs.max_requests_per_user ?? 5,
        rejectExplicit: prefs.reject_explicit ?? false,
        welcomeMessage: prefs.welcome_message ?? '',
        autoRejectBlacklist: prefs.auto_reject_blacklist ?? true,
      }}
    />
  );
}
