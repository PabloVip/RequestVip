-- TuneDrop · Schema completo
-- Ejecutar en el SQL Editor de Supabase

-- =====================================================================
-- 1. DJs
-- =====================================================================
create table public.djs (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete cascade,
  display_name    text        not null,
  slug            text        unique not null,
  ig_username     text        not null,
  ig_user_id      text,
  ig_access_token text,
  ig_token_expires_at timestamptz,
  plan            text        not null default 'free' check (plan in ('free','pro')),
  created_at      timestamptz not null default now()
);

create index on public.djs (slug);

-- =====================================================================
-- 2. Sesiones (cada gig del DJ)
-- =====================================================================
create table public.sessions (
  id              uuid primary key default gen_random_uuid(),
  dj_id           uuid not null references public.djs(id) on delete cascade,
  venue           text,
  qr_token        text unique not null,
  ig_post_id      text,
  ig_post_code    text,
  verification_code_prefix text not null default 'TD',
  status          text not null default 'active' check (status in ('active','paused','ended')),
  accepting       boolean not null default true,
  started_at      timestamptz not null default now(),
  ended_at        timestamptz
);

create index on public.sessions (dj_id, status);
create index on public.sessions (qr_token);

-- =====================================================================
-- 3. Usuarios (asistentes)
-- =====================================================================
create table public.attendees (
  id              uuid primary key default gen_random_uuid(),
  ig_username     text unique not null,
  ig_user_id      text unique,
  display_name    text,
  avatar_url      text,
  first_seen_at   timestamptz not null default now()
);

create index on public.attendees (ig_username);

-- =====================================================================
-- 4. Verificaciones de follow (cache)
-- =====================================================================
create table public.follow_verifications (
  attendee_id     uuid not null references public.attendees(id) on delete cascade,
  dj_id           uuid not null references public.djs(id) on delete cascade,
  method          text not null check (method in ('oauth','comment','manual')),
  verified_at     timestamptz not null default now(),
  expires_at      timestamptz not null default (now() + interval '30 days'),
  primary key (attendee_id, dj_id)
);

create index on public.follow_verifications (expires_at);

-- =====================================================================
-- 5. Peticiones de canciones
-- =====================================================================
create table public.song_requests (
  id              uuid primary key default gen_random_uuid(),
  session_id      uuid not null references public.sessions(id) on delete cascade,
  attendee_id     uuid not null references public.attendees(id),
  spotify_track_id text not null,
  title           text not null,
  artist          text not null,
  album_art_url   text,
  duration_ms     int,
  bpm             numeric(5,1),
  key_signature   text,
  energy          numeric(3,2),
  status          text not null default 'pending'
                  check (status in ('pending','accepted','rejected','played','expired')),
  rejection_reason text,
  created_at      timestamptz not null default now(),
  responded_at    timestamptz,
  played_at       timestamptz
);

create index on public.song_requests (session_id, status);
create index on public.song_requests (attendee_id, created_at desc);

-- =====================================================================
-- 6. Códigos de verificación pendientes (vía B)
-- =====================================================================
create table public.pending_verifications (
  id              uuid primary key default gen_random_uuid(),
  session_id      uuid not null references public.sessions(id) on delete cascade,
  ig_username     text not null,
  code            text not null,
  created_at      timestamptz not null default now(),
  expires_at      timestamptz not null default (now() + interval '10 minutes'),
  consumed        boolean not null default false
);

create index on public.pending_verifications (session_id, ig_username, consumed);
create index on public.pending_verifications (expires_at);

-- =====================================================================
-- 7. Anti-spam: cooldown por asistente y sesión
-- =====================================================================
create table public.attendee_cooldowns (
  attendee_id     uuid not null references public.attendees(id) on delete cascade,
  session_id      uuid not null references public.sessions(id) on delete cascade,
  last_request_at timestamptz not null default now(),
  request_count   int not null default 1,
  primary key (attendee_id, session_id)
);

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================
alter table public.djs                   enable row level security;
alter table public.sessions              enable row level security;
alter table public.attendees             enable row level security;
alter table public.follow_verifications  enable row level security;
alter table public.song_requests         enable row level security;
alter table public.pending_verifications enable row level security;
alter table public.attendee_cooldowns    enable row level security;

-- Un DJ solo ve y modifica sus propios datos
create policy "DJ sees own profile" on public.djs
  for all using (user_id = auth.uid());

create policy "DJ sees own sessions" on public.sessions
  for all using (dj_id in (select id from public.djs where user_id = auth.uid()));

create policy "DJ sees requests in own sessions" on public.song_requests
  for all using (
    session_id in (
      select s.id from public.sessions s
      join public.djs d on d.id = s.dj_id
      where d.user_id = auth.uid()
    )
  );

-- Las peticiones públicas se leen vía service role desde la API
create policy "Public reads active sessions by qr_token" on public.sessions
  for select using (status = 'active');
