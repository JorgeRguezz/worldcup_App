import { createClient } from 'npm:@supabase/supabase-js@2';

type Reminder = {
  reminder_id: string;
  user_email: string;
  display_name: string;
  match_id: string;
  kickoff_at: string;
  home_team: string;
  away_team: string;
};

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const appUrl = Deno.env.get('APP_URL');
const emailFrom = Deno.env.get('EMAIL_FROM');
const cronSecret = Deno.env.get('REMINDER_CRON_SECRET');

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing Supabase function configuration');
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

function requireEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function encodeBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function formatKickoff(value: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Madrid',
  }).format(new Date(value));
}

async function getGoogleAccessToken(): Promise<string> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: requireEnv('GOOGLE_CLIENT_ID'),
      client_secret: requireEnv('GOOGLE_CLIENT_SECRET'),
      refresh_token: requireEnv('GOOGLE_REFRESH_TOKEN'),
      grant_type: 'refresh_token',
    }),
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(`Google token error: ${JSON.stringify(body)}`);
  }

  return body.access_token;
}

async function sendGmail(to: string, subject: string, html: string): Promise<void> {
  const accessToken = await getGoogleAccessToken();
  const rawMessage = [
    `From: Mundial App <${emailFrom}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    '',
    html,
  ].join('\r\n');

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: encodeBase64Url(rawMessage) }),
  });

  if (!response.ok) {
    throw new Error(`Gmail send error: ${await response.text()}`);
  }
}

function buildEmail(reminder: Reminder): string {
  const homeTeam = escapeHtml(reminder.home_team);
  const awayTeam = escapeHtml(reminder.away_team);
  const displayName = escapeHtml(reminder.display_name);
  const kickoff = escapeHtml(formatKickoff(reminder.kickoff_at));
  const predictionsUrl = `${appUrl}/predicciones`;

  return `
    <p>Hola ${displayName},</p>
    <p>El partido <strong>${homeTeam} vs ${awayTeam}</strong> empieza el ${kickoff} y todavia no has registrado tu prediccion.</p>
    <p>Aun estas a tiempo de jugarla:</p>
    <p><a href="${predictionsUrl}">Ir a mis predicciones</a></p>
  `;
}

async function readJsonBody(request: Request): Promise<Record<string, unknown>> {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

Deno.serve(async (request) => {
  if (cronSecret && request.headers.get('x-reminder-cron-secret') !== cronSecret) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!appUrl || !emailFrom) {
    return Response.json({ error: 'Missing email function configuration' }, { status: 500 });
  }

  const body = await readJsonBody(request);

  if (body.mode === 'test') {
    await sendGmail(
      emailFrom,
      'Prueba de recordatorios Mundial App',
      `
        <p>Este es un correo de prueba de Mundial App.</p>
        <p>Si lo recibes, la conexion entre Supabase Edge Functions y Gmail API funciona correctamente.</p>
      `,
    );

    return Response.json({
      mode: 'test',
      sent: 1,
      to: emailFrom,
    });
  }

  const { data, error } = await supabase.rpc('claim_missing_prediction_email_reminders', {
    p_daily_cap: 400,
    p_limit: 50,
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const reminders = (data ?? []) as Reminder[];
  let sent = 0;
  let failed = 0;

  for (const reminder of reminders) {
    try {
      await sendGmail(
        reminder.user_email,
        'Te falta una prediccion',
        buildEmail(reminder),
      );

      await supabase
        .from('prediction_email_reminders')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          error: null,
        })
        .eq('id', reminder.reminder_id);

      sent += 1;
    } catch (err) {
      await supabase
        .from('prediction_email_reminders')
        .update({
          status: 'failed',
          error: err instanceof Error ? err.message : String(err),
        })
        .eq('id', reminder.reminder_id);

      failed += 1;
    }
  }

  return Response.json({
    claimed: reminders.length,
    sent,
    failed,
  });
});
