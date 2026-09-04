export async function onRequestPost({ request, env }) {
  if (!env.OPENAI_API_KEY) return json({ error: 'OPENAI_API_KEY is not configured.' }, 500);
  const body = await request.json().catch(() => null);
  if (!body?.type || !body?.message) return json({ error: 'type and message are required.' }, 400);
  const system = `You are the other person in a speaking-practice simulator for a teenager. Scenario: ${body.type}. Stay realistic, concise, age-appropriate and challenging but not hostile. Do not turn this into a lecture. Reply as the other person would, then give one short coaching hint in a separate field. This is practice, not a real transaction.`;
  const input = `Conversation so far:\n${JSON.stringify(body.history || [])}\n\nSpeaker says: ${body.message}`;
  const schema = { type:'object', additionalProperties:false, properties:{ reply:{type:'string'}, coachingHint:{type:'string'} }, required:['reply','coachingHint'] };
  const r = await fetch('https://api.openai.com/v1/responses', {
    method:'POST', headers:{Authorization:`Bearer ${env.OPENAI_API_KEY}`,'content-type':'application/json'},
    body:JSON.stringify({ model:env.OPENAI_MODEL || 'gpt-5.6-luna', store:false, instructions:system, input, text:{format:{type:'json_schema',name:'simulator_turn',strict:true,schema}} })
  });
  const data = await r.json();
  if (!r.ok) return json({error:data?.error?.message || 'Simulator failed.'}, r.status);
  try { return json(JSON.parse(data.output_text || '')); } catch { return json({error:'Unreadable simulator response.'},502); }
}
function json(body,status=200){return new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json'}})}
