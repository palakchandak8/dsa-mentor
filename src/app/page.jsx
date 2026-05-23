'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const supabase = createClient();
  const router   = useRouter();

  const [mode,     setMode]     = useState('login');   // 'login' | 'signup'
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [name,     setName]     = useState('');
  const [loading,  setLoading]  = useState(false);
  const [msg,      setMsg]      = useState(null);       // { type, text }

  // If already logged in, go straight to dashboard
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.replace('/dashboard');
    });
  }, []);

  /* ── Email auth ─────────────────────────────────────── */
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setMsg(null);

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg({ type: 'err', text: error.message });
      else router.push('/dashboard');
    } else {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: name } },
      });
      if (error) setMsg({ type: 'err', text: error.message });
      else setMsg({ type: 'ok', text: '✅ Check your email to confirm your account, then sign in.' });
    }
    setLoading(false);
  }

  /* ── OAuth ──────────────────────────────────────────── */
  async function oAuth(provider) {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setMsg({ type: 'err', text: error.message });
  }

  /* ── UI ─────────────────────────────────────────────── */
  return (
    <div style={s.page}>

      {/* ── Left panel ── */}
      <div style={s.left}>
        {/* PC logo mark */}
        <div style={s.pcLogo}>
          <span style={s.pcLetters}>PC</span>
        </div>

        <h1 style={s.tagline}>
          Master DSA from<br/>
          <span style={{ color: 'var(--ac)' }}>Zero → Hero</span>
        </h1>
        <p style={s.tagSub}>
          PC DSA Mentor is a free AI tutor for Data Structures &amp; Algorithms.
          Ask anything — get instant, level-adaptive explanations, code, dry-runs, and MCQs.
        </p>

        {/* feature pills */}
        <div style={s.pills}>
          {[
            '🤖  AI answers powered by Llama 3.3',
            '📚  12+ DSA topics with subtopics',
            '🎯  Beginner → Intermediate → Advanced',
            '📝  Full chat history saved',
            '👤  Personal profile & progress',
            '💸  100% Free — no card needed',
          ].map(f => (
            <div key={f} style={s.pill}>{f}</div>
          ))}
        </div>

        {/* Credit */}
        <div style={s.credit}>
          Built by&nbsp;
          <a href="https://github.com/palakchandak8" target="_blank" style={{ color: 'var(--ac)', fontWeight: 600 }}>
            palakchandak8
          </a>
          &nbsp;·&nbsp;
          <a href="mailto:palak.chandak@somaiya.edu" style={{ color: 'var(--tx3)' }}>
            palak.chandak@somaiya.edu
          </a>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div style={s.right}>
        <div style={s.card}>

          {/* Card header */}
          <div style={s.cardHead}>
            <div style={s.cardLogo}>PC</div>
            <div>
              <div style={s.cardTitle}>{mode === 'login' ? 'Welcome back 👋' : 'Join PC Mentor 🚀'}</div>
              <div style={s.cardSub}>{mode === 'login' ? 'Sign in to continue learning' : 'Start your DSA journey today'}</div>
            </div>
          </div>

          {/* OAuth */}
          <button style={s.oBtn} onClick={() => oAuth('google')}>
            <GoogleIcon /> Continue with Google
          </button>
          <button style={s.oBtn} onClick={() => oAuth('github')}>
            <GitHubIcon /> Continue with GitHub
          </button>

          <div style={s.divider}><span style={s.divTxt}>or use email</span></div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <input
                style={s.input} placeholder="Full name"
                value={name} onChange={e => setName(e.target.value)} required
              />
            )}
            <input
              style={s.input} type="email" placeholder="Email address"
              value={email} onChange={e => setEmail(e.target.value)} required
            />
            <input
              style={s.input} type="password" placeholder="Password (min 6 chars)"
              value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
            />

            {msg && (
              <div style={{ ...s.msg, ...(msg.type === 'err' ? s.msgErr : s.msgOk) }}>
                {msg.text}
              </div>
            )}

            <button type="submit" style={s.submit} disabled={loading}>
              {loading ? <span className="spin" style={{ display:'inline-block', width:16, height:16, border:'2px solid #fff', borderTopColor:'transparent', borderRadius:'50%' }} /> : (mode === 'login' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          {/* Switch mode */}
          <div style={s.switch}>
            {mode === 'login' ? "Don't have an account?" : 'Already have one?'}
            <button
              style={s.switchBtn}
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMsg(null); }}
            >
              {mode === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ── SVG icons ─────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" style={{ flexShrink:0 }}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}
function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--tx)" style={{ flexShrink:0 }}>
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>
  );
}

/* ── Styles ─────────────────────────────────────────────── */
const s = {
  page:    { display:'flex', height:'100vh', overflow:'hidden', background:'var(--bg)' },
  left:    { flex:1, padding:'48px 56px', display:'flex', flexDirection:'column', justifyContent:'center', background:'var(--bg2)', borderRight:'1px solid var(--br)' },

  pcLogo:  { width:60, height:60, borderRadius:16, background:'var(--ac-dim)', border:'1.5px solid var(--br-ac)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:28, boxShadow:'0 0 0 1px var(--bg2), 0 0 20px var(--ac-glow)' },
  pcLetters:{ fontFamily:'var(--mono)', fontWeight:700, fontSize:20, color:'var(--ac)', letterSpacing:'-0.5px' },

  tagline: { fontSize:32, fontWeight:800, lineHeight:1.25, marginBottom:14, color:'var(--tx)' },
  tagSub:  { fontSize:14, color:'var(--tx2)', lineHeight:1.75, marginBottom:32, maxWidth:400 },
  pills:   { display:'flex', flexDirection:'column', gap:9, marginBottom:'auto' },
  pill:    { fontSize:12.5, color:'var(--tx2)', padding:'1px 0' },
  credit:  { marginTop:36, fontSize:11.5, color:'var(--tx3)' },

  right:   { width:440, display:'flex', alignItems:'center', justifyContent:'center', padding:'32px 24px', background:'var(--bg)' },
  card:    { width:'100%', maxWidth:376 },

  cardHead:  { display:'flex', alignItems:'center', gap:12, marginBottom:24 },
  cardLogo:  { width:40, height:40, borderRadius:11, background:'var(--ac-dim)', border:'1px solid var(--br-ac)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--mono)', fontWeight:700, fontSize:14, color:'var(--ac)', flexShrink:0 },
  cardTitle: { fontSize:18, fontWeight:700, color:'var(--tx)' },
  cardSub:   { fontSize:12, color:'var(--tx3)', marginTop:2 },

  oBtn:    { width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:10, padding:'11px 16px', background:'var(--bg3)', border:'1px solid var(--br2)', borderRadius:9, color:'var(--tx2)', fontSize:13, fontWeight:500, marginBottom:9, transition:'background .15s' },

  divider: { position:'relative', margin:'18px 0', textAlign:'center' },
  divTxt:  { padding:'0 12px', background:'var(--bg)', color:'var(--tx3)', fontSize:11.5, position:'relative', zIndex:1 },

  input:   { display:'block', width:'100%', padding:'11px 13px', background:'var(--bg3)', border:'1px solid var(--br)', borderRadius:9, color:'var(--tx)', fontSize:13, outline:'none', marginBottom:10, transition:'border-color .2s' },
  msg:     { padding:'10px 13px', borderRadius:8, fontSize:12, lineHeight:1.5, marginBottom:10 },
  msgErr:  { background:'rgba(239,68,68,0.1)', color:'#f87171', border:'1px solid rgba(239,68,68,0.2)' },
  msgOk:   { background:'var(--ac-dim)', color:'var(--ac)', border:'1px solid var(--br-ac)' },
  submit:  { width:'100%', padding:'12px', background:'var(--ac)', border:'none', borderRadius:9, color:'#fff', fontSize:14, fontWeight:700, marginTop:4, display:'flex', alignItems:'center', justifyContent:'center', gap:8 },

  switch:    { textAlign:'center', marginTop:20, fontSize:13, color:'var(--tx3)' },
  switchBtn: { background:'none', border:'none', color:'var(--ac)', fontWeight:600, fontSize:13, marginLeft:6 },
};
