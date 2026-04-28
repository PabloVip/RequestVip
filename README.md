# TuneDrop

App web para que asistentes a una sesión de DJ puedan pedir canciones tras seguir al DJ en Instagram. El DJ acepta o rechaza cada petición desde un dashboard en tiempo real.

## Stack

- Next.js 14 App Router (PWA, sin instalación nativa)
- Supabase (Auth, Postgres, Realtime, RLS)
- Spotify Web API (búsqueda y audio features)
- Instagram Login API + Graph API (verificación híbrida)
- Upstash Redis (rate limiting, opcional para escala)
- Cloudflare R2 (QRs y avatares, opcional)

## Estructura

```
src/
  app/api/
    instagram/oauth/start          → inicia OAuth (vía A)
    instagram/oauth/callback       → recibe código, crea attendee
    instagram/verify-comment/start → genera código de verificación (vía B)
    instagram/verify-comment/confirm → verifica comentario en post del DJ
    spotify/search                 → proxy de búsqueda
    requests                       → POST: crear petición
    requests/[id]                  → PATCH: aceptar/rechazar/played
  lib/
    instagram.ts                   → ambas vías de verificación
    spotify.ts                     → búsqueda y audio features
    supabase-server.ts             → clientes server-side
    use-live-requests.ts           → hook realtime para el DJ
supabase/
  schema.sql                       → todas las tablas y RLS
```

## Las dos vías de verificación

### Vía A · OAuth (cuentas profesionales)

Solo funciona con cuentas Creador o Negocio (limitación de Meta desde diciembre 2024).

1. Asistente pulsa "Iniciar sesión con Instagram" en `/s/[sessionId]`
2. Redirige a `/api/instagram/oauth/start?session_id=...` que firma un state con CSRF y lleva al diálogo de Instagram
3. Instagram redirige a `/api/instagram/oauth/callback` con un `code`
4. El callback intercambia código → token corto → token largo (60 días) → perfil
5. Se crea o actualiza el `attendee` y se cachea la verificación 30 días
6. Cookie `attendee_id` se guarda y el asistente vuelve a la pantalla de petición

### Vía B · Verificación por comentario

Para asistentes con cuenta personal (la mayoría).

1. Asistente introduce su `@username`
2. La app genera un código `TD-XXXXX` y se lo muestra
3. Asistente abre el último post del DJ y escribe ese código como comentario
4. La app, usando el token del DJ, lee `GET /{ig_post_id}/comments` y busca:
   - un comentario cuyo `username` coincida con el introducido
   - cuyo `text` contenga el código generado
5. Si match → se cachea verificación, se guarda cookie

El truco clave: la Graph API permite a un usuario profesional leer los comentarios en sus propios posts, sin permisos especiales sobre las cuentas que comentan. Por eso esta vía no necesita que el asistente tenga cuenta profesional.

## Setup

### 1. Supabase

- Crear proyecto en supabase.com
- Ejecutar `supabase/schema.sql` en el SQL Editor
- Activar Realtime en `song_requests` (Database → Replication)
- Copiar URL, anon key y service role key a `.env.local`

### 2. Spotify

- Registrar app en developer.spotify.com
- Solo se usan client credentials (no necesitas redirect URI)
- Copiar client ID y secret a `.env.local`

### 3. Instagram

Esta es la parte más laboriosa. La app necesita estar registrada en Meta como aplicación con permisos `instagram_business_basic`.

- developers.facebook.com → My Apps → Create App
- Tipo de app: Business
- Añadir producto "Instagram"
- En Instagram → API setup with Instagram login
- Configurar redirect URI: `https://tudominio.com/api/instagram/oauth/callback`
- Para producción necesitarás App Review de Meta (suele tardar 1-3 semanas)
- Para desarrollo puedes usar usuarios de prueba sin pasar por review

Cada DJ debe iniciar sesión también con Instagram al registrarse en TuneDrop, porque la vía B necesita el token del DJ para leer los comentarios de sus propios posts.

## Decisiones técnicas

**¿Por qué cookies httpOnly y no JWT?** El asistente no es un usuario de Supabase Auth, es alguien anónimo que ha verificado un follow puntual. Una cookie firmada apuntando a su `attendee_id` es más simple y no expone el token a JS del cliente.

**¿Por qué cachear la verificación 30 días?** Los DJs tocan una vez al mes en una sala, y un asistente recurrente no debería re-verificar cada vez. 30 días es suficiente para no perder el follow real (si dejara de seguir, la siguiente verificación lo detectaría — aunque la app no lo verifica activamente, podríamos añadir un job nocturno).

**¿Por qué no Spotify OAuth para el asistente?** No es necesario — el asistente no reproduce, solo identifica. La búsqueda funciona con client credentials de la app de Spotify, sin tocar la cuenta del usuario.

**¿Por qué Supabase Realtime y no Pusher?** Si ya tienes Postgres y Auth ahí, sumar otro servicio es coste sin beneficio. Realtime de Supabase escala bien hasta varios miles de conexiones simultáneas.

## Seguridad

- RLS activado en todas las tablas. Un DJ solo puede leer y modificar sus propios datos.
- El service role key solo se usa en server-side desde rutas API.
- CSRF protection en el flujo OAuth con state firmado + cookie httpOnly.
- Rate limiting por sesión y por usuario (5 peticiones máx por sesión, cooldown de 5 min).
- Validación de input con Zod en cada endpoint.
- Sanitización del `ig_username` con regex (solo caracteres válidos de Instagram).

## Lo que falta para producción

- Pantalla de admin del DJ (login, configurar Instagram, generar QR)
- UI completa de la PWA del asistente
- Sistema de notificaciones push (Web Push API)
- Cron job que expire peticiones pendientes pasadas N horas
- App Review de Meta antes de salir (sin esto, solo usuarios de prueba pueden hacer login)
- Branding y onboarding del DJ
- Plan de pago (Stripe) para el tier Pro
