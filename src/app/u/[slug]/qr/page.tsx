import { notFound } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase-server';
import QRView from '@/app/qr/[sessionId]/qr-view';

export default async function PermanentQRPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createServiceClient();

  const { data: dj } = await supabase
    .from('djs')
    .select('display_name, ig_username, slug')
    .eq('slug', slug)
    .single();

  if (!dj) notFound();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const url = `${baseUrl}/u/${dj.slug}`;

  return (
    <QRView
      url={url}
      djName={dj.display_name}
      djInstagram={dj.ig_username}
      venue={null}
    />
  );
}
