import { createClient } from '@/lib/supabase-server';
import { SYSTEM_PROMPT } from '@/lib/constants';

// Uses Groq — 100% FREE, no credit card
// Model: llama-3.3-70b-versatile
// Limits: 6,000 requests/day, 131k token context
export async function POST(req) {
  try {
    // 1. Auth check
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // 2. Parse request
    const { messages, level, sessionId, userName } = await req.json();
    if (!messages?.length) return Response.json({ error: 'No messages' }, { status: 400 });

    // 3. Call Groq
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model:      'llama-3.3-70b-versatile',
        max_tokens: 1500,
        temperature: 0.7,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT(level || 'Beginner', userName) },
          ...messages,
        ],
      }),
    });

    const groqData = await groqRes.json();
    if (!groqRes.ok) throw new Error(groqData.error?.message || 'Groq API error');

    const reply = groqData.choices[0].message.content;

    // 4. Persist to Supabase
    if (sessionId) {
      const lastUser = messages[messages.length - 1];
      await supabase.from('messages').insert([
        { session_id: sessionId, user_id: user.id, role: 'user',      content: lastUser.content },
        { session_id: sessionId, user_id: user.id, role: 'assistant', content: reply },
      ]);
      await supabase
        .from('sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', sessionId);
    }

    return Response.json({ content: reply });
  } catch (err) {
    console.error('[PC DSA Mentor] chat error:', err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
