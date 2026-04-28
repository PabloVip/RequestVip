import { z } from 'zod';
import { createServiceClient } from './supabase-server';

const IG_TOKEN_URL = 'https://api.instagram.com/oauth/access_token';
const IG_LONG_TOKEN_URL = 'https://graph.instagram.com/access_token';
const IG_GRAPH = 'https://graph.instagram.com';

// =====================================================================
// VÍA A · OAuth (Instagram Login API · cuentas profesionales)
// =====================================================================

export function buildOAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.INSTAGRAM_APP_ID!,
    redirect_uri: process.env.INSTAGRAM_REDIRECT_URI!,
    response_type: 'code',
    scope: 'instagram_business_basic',
    state,
  });
  return `https://www.instagram.com/oauth/authorize?${params}`;
}

const ShortTokenSchema = z.object({
  access_token: z.string(),
  user_id: z.union([z.string(), z.number()]).transform(String),
});

const LongTokenSchema = z.object({
  access_token: z.string(),
  expires_in: z.number(),
});

const ProfileSchema = z.object({
  id: z.string(),
  username: z.string(),
  account_type: z.string().optional(),
});

export interface InstagramProfile {
  igUserId: string;
  username: string;
  accessToken: string;
  expiresAt: Date;
}

export async function exchangeCodeForProfile(code: string): Promise<InstagramProfile> {
  const tokenRes = await fetch(IG_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.INSTAGRAM_APP_ID!,
      client_secret: process.env.INSTAGRAM_APP_SECRET!,
      grant_type: 'authorization_code',
      redirect_uri: process.env.INSTAGRAM_REDIRECT_URI!,
      code,
    }),
  });
  if (!tokenRes.ok) {
    const body = await tokenRes.text();
    throw new Error(`IG token exchange failed: ${tokenRes.status} ${body}`);
  }
  const short = ShortTokenSchema.parse(await tokenRes.json());

  const longUrl = new URL(IG_LONG_TOKEN_URL);
  longUrl.searchParams.set('grant_type', 'ig_exchange_token');
  longUrl.searchParams.set('client_secret', process.env.INSTAGRAM_APP_SECRET!);
  longUrl.searchParams.set('access_token', short.access_token);
  const longRes = await fetch(longUrl);
  if (!longRes.ok) throw new Error(`IG long-lived token failed: ${longRes.status}`);
  const long = LongTokenSchema.parse(await longRes.json());

  const profileUrl = new URL(`${IG_GRAPH}/${short.user_id}`);
  profileUrl.searchParams.set('fields', 'id,username,account_type');
  profileUrl.searchParams.set('access_token', long.access_token);
  const profileRes = await fetch(profileUrl);
  if (!profileRes.ok) throw new Error(`IG profile fetch failed: ${profileRes.status}`);
  const profile = ProfileSchema.parse(await profileRes.json());

  return {
    igUserId: profile.id,
    username: profile.username,
    accessToken: long.access_token,
    expiresAt: new Date(Date.now() + long.expires_in * 1000),
  };
}

// =====================================================================
// VÍA B · Verificación por comentario en post del DJ
// =====================================================================

export function generateVerificationCode(): string {
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `TD-${random}`;
}

const CommentsSchema = z.object({
  data: z.array(z.object({
    id: z.string(),
    text: z.string(),
    username: z.string(),
    timestamp: z.string(),
  })),
});

export async function fetchPostComments(
  igPostId: string,
  djAccessToken: string
): Promise<Array<{ id: string; text: string; username: string }>> {
  const url = new URL(`${IG_GRAPH}/${igPostId}/comments`);
  url.searchParams.set('fields', 'id,text,username,timestamp');
  url.searchParams.set('access_token', djAccessToken);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`IG comments fetch failed: ${res.status}`);
  const parsed = CommentsSchema.parse(await res.json());
  return parsed.data.map((c) => ({ id: c.id, text: c.text, username: c.username }));
}

export interface CommentVerificationResult {
  verified: boolean;
  username?: string;
  igUserId?: string;
}

export async function verifyByComment(args: {
  sessionId: string;
  igUsername: string;
  code: string;
  djId: string;
}): Promise<CommentVerificationResult> {
  const supabase = createServiceClient();

  const { data: session, error: sErr } = await supabase
    .from('sessions')
    .select('id, ig_post_id, dj_id, djs(ig_access_token)')
    .eq('id', args.sessionId)
    .single();

  if (sErr || !session?.ig_post_id) {
    throw new Error('Session has no linked Instagram post');
  }
  const djToken = (session.djs as { ig_access_token: string } | null)?.ig_access_token;
  if (!djToken) throw new Error('DJ has no Instagram token');

  const { data: pending, error: pErr } = await supabase
    .from('pending_verifications')
    .select('id, code, expires_at, consumed')
    .eq('session_id', args.sessionId)
    .eq('ig_username', args.igUsername.toLowerCase())
    .eq('consumed', false)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (pErr || !pending) return { verified: false };
  if (pending.code !== args.code) return { verified: false };

  const comments = await fetchPostComments(session.ig_post_id, djToken);
  const match = comments.find(
    (c) =>
      c.username.toLowerCase() === args.igUsername.toLowerCase() &&
      c.text.includes(args.code)
  );
  if (!match) return { verified: false };

  await supabase
    .from('pending_verifications')
    .update({ consumed: true })
    .eq('id', pending.id);

  return {
    verified: true,
    username: args.igUsername.toLowerCase(),
  };
}

// =====================================================================
// Helper común · cachear verificación
// =====================================================================

export async function cacheFollowVerification(args: {
  attendeeId: string;
  djId: string;
  method: 'oauth' | 'comment' | 'manual';
}): Promise<void> {
  const supabase = createServiceClient();
  await supabase.from('follow_verifications').upsert({
    attendee_id: args.attendeeId,
    dj_id: args.djId,
    method: args.method,
    verified_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  });
}

export async function isFollowVerified(args: {
  attendeeId: string;
  djId: string;
}): Promise<boolean> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from('follow_verifications')
    .select('expires_at')
    .eq('attendee_id', args.attendeeId)
    .eq('dj_id', args.djId)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();
  return !!data;
}
