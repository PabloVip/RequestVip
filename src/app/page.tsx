import { redirect } from 'next/navigation';
import { createUserClient } from '@/lib/supabase-server';

export default async function Home() {
  const supabase = await createUserClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/admin');
  } else {
    redirect('/login');
  }
}
