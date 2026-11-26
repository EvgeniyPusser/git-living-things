// Emails the portal owner when someone registers, publishes a public passport or comments.
// Called only by database triggers (see migrations/*_owner_notifications.sql), which send
// the shared secret in the x-notify-secret header.
//
// Function secrets (Edge Functions → Secrets):
//   NOTIFY_SECRET  random string, the same value as the Vault secret "notify_secret"
//   SMTP_PASSWORD  password of the SMTP_USER mailbox
// Optional: SMTP_HOST (smtp.hostinger.com), SMTP_PORT (465), SMTP_USER and NOTIFY_TO
// (both evgenii@living-things.org).
import nodemailer from 'npm:nodemailer@6.9.16';

const portal = 'https://portal.living-things.org/';
const env = (name: string, fallback = '') => Deno.env.get(name) || fallback;
const user = env('SMTP_USER', 'evgenii@living-things.org');
const transport = nodemailer.createTransport({
  host: env('SMTP_HOST', 'smtp.hostinger.com'),
  // Supabase Edge Functions block outgoing port 587, so use implicit TLS on 465.
  port: Number(env('SMTP_PORT', '465')),
  secure: true,
  auth: { user, pass: env('SMTP_PASSWORD') }
});

type Event =
  | { kind: 'signup'; name: string; email: string }
  | { kind: 'published'; id: string; title: string; author: string }
  | { kind: 'comment'; passport: string; title: string; name: string; message: string };

function letter(event: Event) {
  const link = (id: string) => portal + '#/passport/' + encodeURIComponent(id);
  switch (event.kind) {
    case 'signup':
      return { subject: 'Новая регистрация: ' + (event.name || event.email),
        text: 'На портале зарегистрировался новый пользователь.\n\nИмя: ' + event.name + '\nПочта: ' + event.email + '\n' };
    case 'published':
      return { subject: 'Опубликован паспорт: ' + event.title,
        text: 'Опубликован публичный паспорт.\n\nНазвание: ' + event.title + '\nАвтор: ' + (event.author || '—') +
          '\n\n' + link(event.id) + '\n' };
    case 'comment':
      return { subject: 'Новый комментарий: ' + event.title,
        text: event.name + ' оставил(а) комментарий к паспорту «' + event.title + '»:\n\n' + event.message +
          '\n\n' + link(event.passport) + '\n' };
  }
}

Deno.serve(async req => {
  const secret = env('NOTIFY_SECRET');
  if (req.method !== 'POST' || !secret || req.headers.get('x-notify-secret') !== secret) {
    return new Response('forbidden', { status: 403 });
  }
  const event = await req.json() as Event;
  const content = letter(event);
  if (!content) return new Response('unknown event', { status: 400 });
  await transport.sendMail({ from: 'Living Things <' + user + '>', to: env('NOTIFY_TO', user), ...content });
  return new Response('sent');
});
