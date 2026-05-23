import { createClient } from '@/lib/supabase-server';
import { SYSTEM_PROMPT } from '@/lib/constants';

export async function POST(req) {
  try {
    const supabase = createClient();

    // Use getSession instead of getUser — reads cookies reliably in API routes
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = session.user;

    const { messages, level, sessionId, userName } = await req.json();
    if (!messages?.length) return Response.json({ error: 'No messages' }, { status: 400 });

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model:       'llama-3.3-70b-versatile',
        max_tokens:  1500,
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
    console.error('[PC DSA Mentor] error:', err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
}