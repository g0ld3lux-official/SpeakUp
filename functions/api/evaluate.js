export async function onRequestPost({ request, env }) {
  if (!env.OPENAI_API_KEY) return json({ error: 'OPENAI_API_KEY is not configured.' }, 500);
  const body = await request.json().catch(() => null);
  if (!body?.transcript) return json({ error: 'Transcript is required.' }, 400);

  const prompt = `You are SpeakUp, a supportive speaking coach for a teenager. Grade the response to the prompt below. Be fair rather than harsh. Do not compare the speaker to other people and do not comment on physical appearance. Focus only on communication skill.

PROMPT: ${body.prompt || 'Open speaking practice'}
TRANSCRIPT: ${body.transcript}
DURATION_SECONDS: ${Number(body.durationSeconds) || 0}

Return ONLY JSON matching the supplied schema. Scores are integers from 0 to 10. Give concise, useful feedback. Mention strengths and the 2-3 highest-value improvements. If duration is available, calculate approximate words per minute from transcript word count / duration. Detect common fillers such as um, uh, like, you know, basically, literally, so, I mean; do not count normal uses of words such as 'like' when clearly not filler.`;

  const schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
      overall: { type: 'integer' },
      clarity: { type: 'integer' },
      structure: { type: 'integer' },
      vocabulary: { type: 'integer' },
      argument: { type: 'integer' },
      conciseness: { type: 'integer' },
      fluency: { type: 'integer' },
      wordsPerMinute: { type: 'number' },
      fillerCount: { type: 'integer' },
      fillers: { type: 'array', items: { type: 'string' } },
      strengths: { type: 'array', items: { type: 'string' } },
      improvements: { type: 'array', items: { type: 'string' } },
      summary: { type: 'string' }
    },
    required: ['overall','clarity','structure','vocabulary','argument','conciseness','fluency','wordsPerMinute','fillerCount','fillers','strengths','improvements','summary']
  };

  const r = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model: env.OPENAI_MODEL || 'gpt-5.6-luna',
      store: false,
      input: prompt,
      text: { format: { type: 'json_schema', name: 'speaking_evaluation', strict: true, schema } }
    })
  });
  const data = await r.json();
  if (!r.ok) return json({ error: data?.error?.message || 'AI evaluation failed.' }, r.status);
  const text = data.output_text || extractOutputText(data);
  try { return json(JSON.parse(text)); }
  catch { return json({ error: 'The AI returned an unreadable evaluation.' }, 502); }
}

function extractOutputText(data) {
  return (data.output || []).flatMap(x => x.content || []).filter(x => x.type === 'output_text').map(x => x.text).join('');
}
function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}
