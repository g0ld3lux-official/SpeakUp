export async function onRequestPost({ request, env }) {
  if (!env.OPENAI_API_KEY) return json({ error: 'OPENAI_API_KEY is not configured.' }, 500);
  const incoming = await request.formData();
  const file = incoming.get('file');
  if (!(file instanceof File)) return json({ error: 'No audio file received.' }, 400);
  if (file.size > 25 * 1024 * 1024) return json({ error: 'Audio file is too large.' }, 413);

  const form = new FormData();
  form.append('file', file, file.name || 'speech.webm');
  form.append('model', 'gpt-4o-mini-transcribe');
  form.append('response_format', 'json');

  const r = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}` },
    body: form
  });
  const data = await r.json();
  if (!r.ok) return json({ error: data?.error?.message || 'Transcription failed.' }, r.status);
  return json({ text: data.text || '' });
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}
