import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export default async function Home() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.getAll().find(c => c.name.includes('auth-token'));

  if (accessToken) {
    redirect('/admin');
  } else {
    redirect('/login');
  }
}
