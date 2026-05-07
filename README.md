# TuneVIP

> Sistema de peticiones musicales en tiempo real para DJs y eventos en vivo.

## 1. Descripción

TuneVIP permite a los asistentes de un evento escanear un **QR permanente** del DJ, verificar que le siguen en Instagram y enviar peticiones de canciones en tiempo real. El DJ recibe las peticiones en un dashboard con BPM, clave musical y controles de aceptar/rechazar/marcar como sonada.

**URL de producción:** https://tunevip.vercel.app  
**Repositorio:** https://github.com/PabloVip/RequestVip  
**Proyecto local:** `~/Desktop/web/files/tunedrop`

---

## 2. Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 14.2.15 (App Router) |
| Lenguaje | TypeScript |
| Auth + DB + Realtime | Supabase (PostgreSQL + RLS + Realtime) |
| Despliegue | Vercel (Hobby) |
| Búsqueda musical | Deezer API (sin auth) |
| BPM y clave musical | GetSongBPM API (api.getsong.co) |
| Tipografía | Geist (Google Fonts) |
| Estilos | CSS-in-JS inline + variables CSS (tema dark/light) |
| Auth flow | Supabase SSR + implicit flow |

**Variables de entorno requeridas:**
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL
GETSONGBPM_API_KEY
```

---

## 3. Arquitectura y Estructura de Archivos

```
src/
├── app/
│   ├── layout.tsx                    # ThemeProvider wrapper, script bloqueante anti-FOUC
│   ├── globals.css                   # Variables CSS de tema, Geist, font-size 16px para iOS
│   ├── page.tsx                      # Redirect / → /admin o /login
│   │
│   ├── login/
│   │   ├── page.tsx
│   │   └── login-form.tsx            # Form con "¿Olvidaste tu contraseña?" link
│   │
│   ├── signup/
│   │   ├── page.tsx
│   │   └── signup-form.tsx           # Form con confirmación de contraseña
│   │
│   ├── forgot-password/
│   │   ├── page.tsx
│   │   └── forgot-password-form.tsx  # Envía email de reset, redirectTo: /reset-password
│   │
│   ├── reset-password/
│   │   ├── page.tsx
│   │   └── reset-password-form.tsx   # Lee sesión del hash (implicit flow)
│   │
│   ├── auth/callback/
│   │   └── route.ts                  # exchangeCodeForSession → redirect a ?next=
│   │
│   ├── legal/
│   │   └── page.tsx                  # Privacidad, términos, cookies, atribuciones (RGPD completo)
│   │
│   ├── admin/
│   │   ├── page.tsx                  # Server component: carga DJ, sesión activa, stats globales
│   │   ├── admin-client.tsx          # UI del panel principal del DJ
│   │   ├── profile/
│   │   │   ├── page.tsx
│   │   │   └── profile-form.tsx      # Editar nombre, IG, qr_tagline
│   │   ├── preferences/
│   │   │   ├── page.tsx
│   │   │   └── preferences-form.tsx  # Blacklist, cooldowns, max peticiones, mensajes
│   │   └── sessions/
│   │       ├── page.tsx              # Historial de sesiones con delete-all
│   │       ├── delete-all-button.tsx
│   │       └── [id]/
│   │           ├── page.tsx          # Detalle de sesión: métricas, top 5, chart
│   │           ├── requests-chart.tsx # SVG chart de peticiones por hora
│   │           └── delete-button.tsx
│   │
│   ├── dj/[sessionId]/
│   │   ├── page.tsx                  # Server: verifica auth + ownership del DJ
│   │   └── dj-dashboard.tsx          # Dashboard realtime: acepta/rechaza/marca sonada, muestra BPM
│   │
│   ├── s/[sessionId]/                # Pantalla del ASISTENTE
│   │   ├── page.tsx                  # force-dynamic, redirect si sesión no activa
│   │   ├── attendee-app.tsx          # Orquesta stages + realtime detecta sesión terminada
│   │   ├── verify-step.tsx           # Verificación de seguimiento en Instagram
│   │   ├── search-step.tsx           # Búsqueda Deezer con debounce 300ms
│   │   ├── status-step.tsx           # Polling cada 3s a /api/requests/[id]/status
│   │   └── session-ended.tsx         # Pantalla "DJ no está pinchando" + botón Instagram
│   │
│   ├── u/[slug]/                     # QR PERMANENTE por DJ
│   │   ├── page.tsx                  # force-dynamic: redirige a sesión activa o NoSession
│   │   ├── no-session.tsx            # "DJ no está pinchando ahora" + botón Instagram
│   │   └── qr/
│   │       └── page.tsx              # Vista de impresión del QR permanente
│   │
│   ├── qr/[sessionId]/               # LEGACY — no usar, mantener por compatibilidad
│   │   └── page.tsx
│   │
│   └── api/
│       ├── attendee/register/
│       │   └── route.ts              # POST: registra asistente anónimo, rate limit 5/min/IP
│       ├── requests/
│       │   ├── route.ts              # POST: crea petición, rate limit 20/min/IP, blacklist, cooldown
│       │   └── [id]/
│       │       ├── route.ts          # PATCH: acepta/rechaza/marca sonada (auth + ownership)
│       │       └── status/
│       │           └── route.ts      # GET: estado de petición filtrado por attendee_id cookie
│       └── sessions/
│           ├── route.ts              # POST: crear sesión
│           ├── [id]/
│           │   ├── route.ts          # PATCH: pausar/reanudar/terminar sesión
│           │   └── delete/
│           │       └── route.ts      # DELETE: borrar sesión individual
│           └── delete-all/
│               └── route.ts          # DELETE: borrar todo el historial
│
├── lib/
│   ├── spotify.ts                    # searchTracks (Deezer) + getAudioFeatures (Deezer → GetSongBPM fallback)
│   ├── supabase-server.ts            # createServiceClient + createUserClient (try/catch en setAll)
│   ├── supabase-browser.ts           # createClient con flowType: 'implicit'
│   ├── use-live-requests.ts          # Hook realtime para el dashboard del DJ
│   └── rate-limit.ts                 # Rate limiting en memoria con Map (sin Redis)
│
└── components/
    ├── theme-provider.tsx            # Context: mode/resolved/setMode/toggle, key 'tunedrop_theme'
    └── theme-toggle.tsx              # Botón sol/luna SVG
```

---

## 4. Lógica del Core

### Flujo completo de una petición

```
Asistente escanea QR (/u/[slug])
  → page.tsx consulta sesión activa del DJ
  → Si activa: redirect a /s/[sessionId]
  → Si no: muestra NoSession con botón Instagram

/s/[sessionId] → attendee-app.tsx
  → Stage 1 (verify): verifica seguimiento Instagram
  → Stage 2 (search): búsqueda Deezer con debounce 300ms → POST /api/requests
  → Stage 3 (status): polling 3s a /api/requests/[id]/status

POST /api/requests → route.ts
  1. Rate limit por IP (20/min)
  2. Verifica cookie attendee_id
  3. Verifica sesión activa y aceptando
  4. Aplica blacklist y filtro explicit del DJ
  5. Verifica cooldown del asistente
  6. Verifica duplicados en cola
  7. Llama a getAudioFeatures (Deezer BPM → GetSongBPM fallback)
  8. Inserta en song_requests
  9. Actualiza attendee_cooldowns

DJ Dashboard (dj-dashboard.tsx)
  → Realtime Supabase escucha INSERT/UPDATE en song_requests
  → Muestra BPM + key_signature de cada petición
  → Botones: Aceptar / Rechazar / Marcar sonada
  → PATCH /api/requests/[id] con auth + ownership check
```

### Sistema de BPM (lib/spotify.ts)

```typescript
getAudioFeatures(trackId):
  1. Llama a Deezer /track/{id} → si t.bpm > 0, devuelve BPM
  2. Si Deezer no tiene BPM: llama a GetSongBPM /search/?lookup={title}
  3. Busca en resultados el artista que más se parezca al original
  4. Devuelve { bpm, key, energy: null }
```

**Importante:** GetSongBPM falla si se incluye el artista en el query. Buscar SOLO por título y filtrar por artista en los resultados.

### QR Permanente vs QR de Sesión

- **`/u/[slug]`** → QR permanente. Siempre válido. Redirige dinámicamente a la sesión activa del DJ.
- **`/s/[sessionId]`** → URL específica de sesión. Expira cuando termina la sesión.
- Los QR físicos deben apuntar SIEMPRE a `/u/[slug]`, nunca a `/s/[id]`.

### Caché y revalidación

Las páginas `/s/[sessionId]` y `/u/[slug]` tienen:
```typescript
export const dynamic = 'force-dynamic';
export const revalidate = 0;
```
Sin esto, Next.js cachea el estado de la sesión y muestra datos obsoletos.

---

## 5. Estado del Proyecto

### ✅ Funcionalidades completadas

- Auth completo (signup con confirmación de contraseña, login, logout, recuperación por email)
- Panel admin DJ con stats globales (sesiones, peticiones, % aceptación)
- Perfil DJ editable (nombre, IG, qr_tagline)
- Preferencias (blacklist, filtros explicit, cooldowns, mensajes personalizados)
- Historial de sesiones con chart SVG de peticiones por hora, top 5, métricas
- Crear / pausar / reanudar / terminar sesiones
- QR permanente por DJ (`/u/[slug]`) con vista de impresión
- Dashboard DJ en tiempo real (Supabase Realtime)
- Pantalla asistente con stages: verify → search → status
- Búsqueda Deezer con debounce 300ms
- BPM automático: Deezer primero, GetSongBPM como fallback
- Clave musical (key_signature) guardada en BD y visible en dashboard
- Notificaciones in-app con sonido sintetizado y vibración
- Sistema de tema dark/light con detección automática
- Responsive mobile completo
- Borrar sesión individual y borrar todo el historial
- Pantalla "sesión terminada" con botón Instagram del DJ
- Detección en tiempo real de sesión terminada (asistente)
- Rate limiting en memoria (20/min peticiones, 5/min registro)
- Página `/legal` con RGPD completo (responsable, derechos ARCO+, plazos, cookies, atribuciones)
- Endpoint `/api/requests/[id]/status` filtrado por attendee_id (seguro)

### ⏳ Pendientes

- **Activar "Confirm email"** en Supabase Auth Settings. Antes ejecutar:
  ```sql
  update auth.users set email_confirmed_at = now() where email_confirmed_at is null;
  ```
- **Cerrar lectura pública de song_requests** (point 3 seguridad):
  ```sql
  drop policy if exists "Attendees read by id" on public.song_requests;
  create policy "Service role only reads" on public.song_requests for select to service_role using (true);
  ```
  El endpoint `/api/requests/[id]/status` ya está preparado para sustituir al realtime directo.
- **Regenerar credenciales Supabase expuestas** en chats anteriores (anon key + service_role key)
- **SMTP propio** para eliminar límite de 2 emails/hora de Supabase Free (Resend o Brevo recomendados)
- **GetSongBPM**: cobertura limitada en música latina/reggaeton. Funciona bien con pop anglosajón y EDM.

---

## 6. Schema de Base de Datos (Supabase)

```sql
-- Tablas principales
djs (id, user_id, display_name, ig_username, slug, qr_tagline, created_at)
sessions (id, dj_id, venue, status, accepting, qr_token, ig_post_code, started_at, ended_at)
attendees (id, guest_id, created_at)
song_requests (id, session_id, attendee_id, spotify_track_id, title, artist,
               album_art_url, duration_ms, bpm, key_signature, energy,
               status, rejection_reason, responded_at, created_at)
follow_verifications (id, attendee_id, session_id, method, created_at)
dj_preferences (id, dj_id, blacklist_terms, reject_explicit, auto_reject_blacklist,
                cooldown_seconds, max_requests_per_user, custom_reject_message,
                custom_accepted_message)
attendee_cooldowns (attendee_id, session_id, last_request_at, request_count)

-- IMPORTANTE: la tabla song_requests usa `responded_at`, NO `accepted_at`/`rejected_at` separadas
-- status values: 'pending' | 'accepted' | 'rejected' | 'played' | 'expired'
```

### Policies RLS activas

```sql
-- DJs solo ven sus propias sesiones y peticiones
"DJ sees requests in own sessions" (ALL on song_requests)
"Service role full access" (ALL to service_role)
-- song_requests: solo service_role puede leer (las demás policies están revocadas)
```

---

## 7. DJs en producción

| display_name | slug | dj_id | user_id |
|---|---|---|---|
| Pablo Vicente | pablovicente | 392bb4e3-5ec1-4805-a98f-b4f472b064ad | 6537a6f4-26c3-4f69-8e13-31812306c091 |
| Sergio Salinas | sergiosalinas | 8d6baee9-b9f0-4edd-a2d2-46851bc30ba6 | — |

---

## 8. Decisiones técnicas clave

| Decisión | Motivo |
|----------|--------|
| Deezer para búsqueda (no Spotify) | Spotify exige Premium del desarrollador desde feb 2026 |
| GetSongBPM para BPM (no Spotify audio-features) | Misma razón + cobertura limitada en música latina |
| GetSongBPM: buscar solo por título, filtrar artista en resultados | Buscar con artista en query devuelve "no result" |
| `flowType: 'implicit'` en supabase-browser | PKCE falla cross-browser en reset password |
| `force-dynamic` en /s y /u páginas | Sin esto Next.js cachea el estado de la sesión |
| try/catch en setAll() de supabase-server | Evita error "cookies can only be modified in Server Action" |
| QR permanente /u/[slug] en lugar de /s/[id] | El QR de sesión específica expira al terminar la sesión |
| Polling 3s en status-step (no Realtime directo) | Más seguro: evita exponer song_requests públicamente |
| Rate limiting en memoria (Map) en lugar de Redis | Suficiente para el volumen actual sin coste extra |
| localStorage keys con prefijo `tunedrop_` | Mantener preferencias de usuarios entre versiones |

---

## 9. Comandos útiles

```bash
# Desarrollo local
npm run dev

# Deploy (automático via git push)
git add . && git commit -m "mensaje" && git push

# Ver logs de producción
# Vercel → Deployments → Functions → Logs

# SQL útiles
-- Ver sesiones activas
select id, dj_id, venue, status from sessions where status = 'active';

-- Ver últimas peticiones con BPM
select title, artist, bpm, key_signature, status from song_requests order by created_at desc limit 20;

-- Terminar sesión zombie
update sessions set status = 'ended', ended_at = now() where id = '[id]';
```

---

## 10. Infraestructura y costes

| Servicio | Plan | Coste | Límites relevantes |
|----------|------|-------|-------------------|
| Vercel | Hobby | Gratis | 100GB bandwidth, 100K invocaciones/mes |
| Supabase | Free | Gratis | 500MB DB, 2 emails/hora, 50K MAU |
| GetSongBPM | Free | Gratis | 3000 req/hora, atribución obligatoria |
| Dominio | — | — | tunevip.vercel.app (subdominio Vercel) |

**Para escalar:** Vercel Pro ($20/mes) + Supabase Pro ($25/mes) cubre hasta ~500 usuarios por evento.

---

*Proyecto iniciado: abril 2026 — Última actualización: mayo 2026*
