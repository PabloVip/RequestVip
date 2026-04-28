import { notFound } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase-server';
import QRView from './qr-view';

export default async function QRPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const supabase = createServiceClient();

  const { data: session } = await supabase
    .from('sessions')
    .select('id, venue, status, djs(display_name, ig_username)')
    .eq('id', sessionId)
    .single();

  if (!session) notFound();

  const dj = session.djs as unknown as {
    display_name: string;
    ig_username: string;
  } | null;

  if (!dj) notFound();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const url = `${baseUrl}/s/${session.id}`;

  return (
    <QRView
      url={url}
      djName={dj.display_name}
      djInstagram={dj.ig_username}
      venue={session.venue}
    />
  );
}
