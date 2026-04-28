import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  generateVerificationCode,
  verifyByComment,
  cacheFollowVerification,
} from '@/lib/instagram';
import { createServiceClient } from '@/lib/supabase-server';

const StartBody = z.object({
  session_id: z.string().uuid(),
  ig_username: z.string().min(1).max(30).regex(/^[a-zA-Z0-9._]+$/),
});

export async function POST(req: NextRequest) {
  const body = StartBody.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
  const { session_id, ig_username } = body.data;
  const supabase = createServiceClient();

  const { data: session } = await supabase
    .from('sessions')
    .select('id, ig_post_id, ig_post_code, dj_id, djs(ig_username)')
    .eq('id', session_id)
    .eq('status', 'active')
    .single();

  if (!session?.ig_post_id) {
    return NextResponse.json(
      { error: 'Session not active or no linked post' },
      { status: 404 }
    );
  }

  const code = generateVerificationCode();

  await supabase.from('pending_verifications').insert({
    session_id,
    ig_username: ig_username.toLowerCase(),
    code,
  });

  const dj = session.djs as { ig_username: string } | null;

  return NextResponse.json({
    code,
    instruction: `Comenta exactamente "${code}" en el último post de @${dj?.ig_username}`,
    post_url: session.ig_post_code
      ? `https://www.instagram.com/p/${session.ig_post_code}/`
      : null,
    expires_in_seconds: 600,
  });
}
