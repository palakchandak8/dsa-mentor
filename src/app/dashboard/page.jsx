'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import Sidebar       from '@/components/Sidebar';
import TopBar        from '@/components/TopBar';
import HistoryPanel  from '@/components/HistoryPanel';
import ProfileModal  from '@/components/ProfileModal';
import { QUICK_CHIPS } from '@/lib/constants';

/* ═══════════════════════════════════════════════════════════
   DASHBOARD — main entry point
══════════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const supabase = createClient();
  const router   = useRouter();
  const bottomRef = useRef(null);

  /* ── State ─────────────────────────────────────────── */
  const [user,      setUser]      = useState(null);
  const [profile,   setProfile]   = useState(null);
  const [panel,     setPanel]     = useState('chat');   // 'chat' | 'history'
  const [level,     setLevel]     = useState('Beginner');
  const [messages,  setMessages]  = useState([]);       // [{role,content}]
  const [inputVal,  setInputVal]  = useState('');
  const [loading,   setLoading]   = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [subtitle,  setSubtitle]  = useState('Ask anything about DSA');
  const [showProf,  setShowProf]  = useState(false);

  /* ── Auth guard ─────────────────────────────────────── */
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.replace('/'); return; }
      setUser(user);
      loadProfile(user.id);
    });
  }, []);

  async function loadProfile(uid) {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single();
    if (data) { setProfile(data); setLevel(data.level_pref || 'Beginner'); }
    else       { setProfile({ id: uid }); }
  }

  /* ── Auto-scroll ───────────────────────────────────── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  /* ── Create new session in Supabase ─────────────────── */
  async function createSession(firstQ) {
    const title = firstQ.length > 65 ? firstQ.slice(0, 62) + '…' : firstQ;
    const { data } = await supabase
      .from('sessions')
      .insert({ user_id: user.id, title, level, topic: null })
      .select().single();
    return data?.id || null;
  }

  /* ── Send message ───────────────────────────────────── */
  const send = useCallback(async (text) => {
    const txt = (text || inputVal).trim();
    if (!txt || loading) return;
    setInputVal('');

    const next = [...messages, { role: 'user', content: txt }];
    setMessages(next);
    setSubtitle(txt.length > 55 ? txt.slice(0, 52) + '…' : txt);
    setLoading(true);

    // Create Supabase session on first message
    let sid = sessionId;
    if (!sid && user) {
      sid = await createSession(txt);
      setSessionId(sid);
    }

    try {
      const res  = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages:  next,
          level,
          sessionId: sid,
          userName:  profile?.full_name,
        }),
      });
      const data = await res.json();
      const reply = data.content || ('⚠️ Error: ' + (data.error || 'Unknown error'));
      setMessages(m => [...m, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: '⚠️ Network error — please try again.' }]);
    }
    setLoading(false);
  }, [inputVal, loading, messages, sessionId, level, profile, user]);

  /* ── New chat ───────────────────────────────────────── */
  function newChat() {
    setMessages([]); setSessionId(null);
    setInputVal(''); setSubtitle('Ask anything about DSA');
  }

  /* ── Load session from history ──────────────────────── */
  async function loadSession(sess) {
    setPanel('chat');
    setSessionId(sess.id);
    setLevel(sess.level || 'Beginner');
    setSubtitle(sess.title);
    const { data } = await supabase
      .from('messages')
      .select('role, content')
      .eq('session_id', sess.id)
      .order('created_at');
    setMessages(data || []);
  }

  /* ── Topic selected from sidebar ────────────────────── */
  function onTopicSelect(topic, sub) {
    newChat();
    // small delay so state clears first
    setTimeout(() => send(`Explain "${sub}" under ${topic} at ${level} level — include definition, analogy, code, and complexity`), 50);
  }

  /* ── Textarea keyboard ──────────────────────────────── */
  function onKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  const showWelcome = messages.length === 0 && !loading;

  /* ═══════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════ */
  return (
    <div style={lay.app}>

      {/* Sidebar column */}
      <div style={lay.sideCol}>
        <Sidebar panel={panel} setPanel={setPanel} onTopicSelect={onTopicSelect} />

        {/* History overlay when panel === 'history' */}
        {panel === 'history' && user && (
          <div style={lay.histOverlay}>
            {/* mini topbar inside overlay */}
            <div style={lay.histHead}>
              <span style={lay.histTitle}>📋 Chat History</span>
              <button style={lay.histClose} onClick={() => setPanel('chat')}>✕</button>
            </div>
            <HistoryPanel
              userId={user.id}
              onLoad={loadSession}
              currentId={sessionId}
            />
          </div>
        )}
      </div>

      {/* Main column */}
      <div style={lay.main}>
        <TopBar
          subtitle={subtitle}
          level={level}
          setLevel={setLevel}
          profile={profile}
          onProfile={() => setShowProf(true)}
          onNewChat={newChat}
        />

        {/* Chat area */}
        <div style={lay.chatArea}>

          {showWelcome ? (
            <Welcome
              profile={profile}
              onChip={send}
            />
          ) : (
            <div style={lay.msgList}>
              {messages.map((m, i) => (
                <Message key={i} msg={m} profile={profile} />
              ))}

              {/* Typing indicator */}
              {loading && (
                <div style={msg.row} className="fade-up">
                  <div style={{ ...msg.avatar, ...msg.avatarAI }}>PC</div>
                  <div style={msg.bubble}>
                    <div style={msg.typing}>
                      {[0, 1, 2].map(i => (
                        <span key={i} style={{ ...msg.dot, animationDelay: `${i * .18}s` }} />
                      ))}
                      <span style={msg.thinkTxt}>PC Mentor is thinking…</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div style={lay.inputArea}>
          <div style={lay.inputWrap}>
            {/* PC badge inside input */}
            <div style={lay.inputBadge}>PC</div>
            <textarea
              style={lay.textarea}
              placeholder="Ask anything about DSA…"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={onKey}
              rows={1}
            />
            <button
              style={{ ...lay.sendBtn, opacity: (!inputVal.trim() || loading) ? .4 : 1 }}
              disabled={!inputVal.trim() || loading}
              onClick={() => send()}
            >
              <SendIcon />
            </button>
          </div>
          <div style={lay.hint}>
            Enter to send · Shift+Enter for new line · Free AI by <span style={{ color:'var(--ac)' }}>PC</span>
          </div>
        </div>
      </div>

      {/* Profile modal */}
      {showProf && profile && (
        <ProfileModal
          profile={profile}
          onClose={() => setShowProf(false)}
          onSaved={p => { setProfile(p); setLevel(p.level_pref); setShowProf(false); }}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   WELCOME SCREEN
══════════════════════════════════════════════════════════════ */
function Welcome({ profile, onChip }) {
  const firstName = profile?.full_name?.split(' ')[0];

  return (
    <div style={wl.wrap} className="fade-up">
      {/* PC logo */}
      <div style={wl.logo}>
        <span style={wl.logoTxt}>PC</span>
      </div>

      <h2 style={wl.title}>
        {firstName ? `Hey ${firstName}! ` : ''}DSA <span style={{ color:'var(--ac)' }}>Mentor</span>
      </h2>
      <p style={wl.sub}>Your free AI tutor for Data Structures & Algorithms — by <strong style={{ color:'var(--ac)' }}>palakchandak8</strong></p>

      {/* Feature cards */}
      <div style={wl.grid}>
        {[
          { icon:'📖', t:'Concept Explanations', d:'From basics to advanced with real analogies', q:'Explain what a Binary Search Tree is and why we use it' },
          { icon:'⚡', t:'Code & Dry Runs',       d:'Step-by-step walkthroughs with examples',   q:'Show me a dry run of merge sort on [5, 2, 8, 1, 9]' },
          { icon:'⏱', t:'Time Complexity',        d:'Understand Big O notation clearly',         q:'Explain Big O notation with examples from O(1) to O(n²)' },
          { icon:'🧩', t:'Practice & MCQs',       d:'Test your knowledge with questions',        q:'Give me 5 MCQs on Arrays with answers' },
        ].map(c => (
          <div key={c.t} style={wl.card} onClick={() => onChip(c.q)}>
            <div style={wl.cardIcon}>{c.icon}</div>
            <div style={wl.cardTitle}>{c.t}</div>
            <div style={wl.cardDesc}>{c.d}</div>
          </div>
        ))}
      </div>

      {/* Quick chips */}
      <p style={wl.chipsLabel}>Try asking:</p>
      <div style={wl.chips}>
        {QUICK_CHIPS.map(c => (
          <button key={c} style={wl.chip} onClick={() => onChip(c)}>{c}</button>
        ))}
      </div>

      {/* PC watermark */}
      <div style={wl.watermark}>PC</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MESSAGE BUBBLE
══════════════════════════════════════════════════════════════ */
function Message({ msg: m, profile }) {
  const isUser = m.role === 'user';
  const initials = (profile?.full_name || 'PC').slice(0, 2).toUpperCase();

  return (
    <div style={{ ...msg.row, ...(isUser ? msg.rowUser : {}) }} className="fade-up">
      <div style={{ ...msg.avatar, ...(isUser ? msg.avatarUser : msg.avatarAI) }}>
        {isUser ? initials : 'PC'}
      </div>
      <div style={{ ...msg.bubble, ...(isUser ? msg.bubbleUser : {}) }}>
        {isUser ? m.content : <FormatAI text={m.content} />}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   AI RESPONSE FORMATTER
══════════════════════════════════════════════════════════════ */
function FormatAI({ text }) {
  const elements = [];
  const lines    = text.split('\n');
  let inCode = false, codeLang = '', codeAcc = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code fence start / end
    if (line.startsWith('```')) {
      if (!inCode) {
        inCode = true; codeLang = line.slice(3).trim() || 'code'; codeAcc = [];
      } else {
        inCode = false;
        elements.push(<CodeBlock key={i} lang={codeLang} code={codeAcc.join('\n')} />);
      }
      continue;
    }
    if (inCode) { codeAcc.push(line); continue; }

    // Headings
    if (/^#{1,3} /.test(line)) {
      elements.push(<h3 key={i} style={fmt.h3}>{inline(line.replace(/^#{1,3} /, ''))}</h3>);
      continue;
    }
    // Complexity badges
    if (/^(TIME|SPACE|Time|Space):\s*O\(/.test(line)) {
      const isT = line.toLowerCase().startsWith('t');
      elements.push(
        <div key={i} style={{ display:'inline-block', marginRight:6, marginBottom:4 }}>
          <span style={{ ...fmt.badge, ...(isT ? fmt.badgeTime : fmt.badgeSpace) }}>
            {isT ? '⏱' : '💾'} {line}
          </span>
        </div>
      );
      continue;
    }
    // Bullet list
    if (/^[-*] /.test(line)) {
      elements.push(<li key={i} style={fmt.li}>{inline(line.slice(2))}</li>);
      continue;
    }
    // Numbered list
    if (/^\d+\.\s/.test(line)) {
      elements.push(<li key={i} style={{ ...fmt.li, listStyleType:'decimal' }}>{inline(line.replace(/^\d+\.\s/, ''))}</li>);
      continue;
    }
    // Empty line
    if (!line.trim()) { elements.push(<div key={i} style={{ height:6 }} />); continue; }
    // Paragraph
    elements.push(<p key={i} style={fmt.p}>{inline(line)}</p>);
  }

  return <div style={fmt.root}>{elements}</div>;
}

/* Inline formatting: **bold**, `code`, *italic* */
function inline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) return <strong key={i} style={{ color:'var(--tx)', fontWeight:600 }}>{p.slice(2,-2)}</strong>;
    if (p.startsWith('`')  && p.endsWith('`'))  return <code key={i} style={fmt.inlineCode}>{p.slice(1,-1)}</code>;
    if (p.startsWith('*')  && p.endsWith('*'))  return <em key={i} style={{ color:'var(--tx2)' }}>{p.slice(1,-1)}</em>;
    return p;
  });
}

/* Code block with copy button */
function CodeBlock({ lang, code }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(code);
    setCopied(true); setTimeout(() => setCopied(false), 1600);
  }
  return (
    <div style={cb.wrap}>
      <div style={cb.head}>
        <span style={cb.lang}>{lang}</span>
        <button style={cb.copy} onClick={copy}>{copied ? '✅ Copied!' : 'Copy'}</button>
      </div>
      <div style={cb.body}>
        <code style={cb.code}>{code}</code>
      </div>
    </div>
  );
}

function SendIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════
   STYLES
══════════════════════════════════════════════════════════════ */
const lay = {
  app:        { display:'flex', height:'100vh', overflow:'hidden', background:'var(--bg)' },
  sideCol:    { position:'relative', width:'var(--sidebar-w)', flexShrink:0 },
  histOverlay:{ position:'absolute', inset:0, background:'var(--bg2)', borderRight:'1px solid var(--br)', display:'flex', flexDirection:'column', zIndex:20 },
  histHead:   { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px 8px', borderBottom:'1px solid var(--br)' },
  histTitle:  { fontSize:12, fontWeight:600, color:'var(--tx2)' },
  histClose:  { background:'none', border:'none', color:'var(--tx3)', fontSize:13, cursor:'pointer' },
  main:       { flex:1, display:'flex', flexDirection:'column', overflow:'hidden' },
  chatArea:   { flex:1, overflowY:'auto', padding:'16px 20px' },
  msgList:    { display:'flex', flexDirection:'column', gap:14, maxWidth:800, margin:'0 auto', width:'100%' },
  inputArea:  { padding:'12px 20px', borderTop:'1px solid var(--br)', background:'var(--bg2)', flexShrink:0 },
  inputWrap:  { display:'flex', alignItems:'flex-end', gap:8, background:'var(--bg3)', border:'1px solid var(--br)', borderRadius:12, padding:'8px 10px', maxWidth:800, margin:'0 auto', transition:'border-color .2s' },
  inputBadge: { fontFamily:'var(--mono)', fontSize:10, fontWeight:700, color:'var(--ac)', padding:'3px 6px', background:'var(--ac-dim)', borderRadius:5, flexShrink:0, marginBottom:2, border:'1px solid var(--br-ac)' },
  textarea:   { flex:1, background:'transparent', border:'none', outline:'none', color:'var(--tx)', fontSize:13, resize:'none', minHeight:20, maxHeight:120, lineHeight:1.55, fontFamily:'var(--font)' },
  sendBtn:    { width:32, height:32, borderRadius:8, background:'var(--ac)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, cursor:'pointer', transition:'opacity .2s' },
  hint:       { textAlign:'center', fontSize:10.5, color:'var(--tx3)', marginTop:6, maxWidth:800, marginLeft:'auto', marginRight:'auto' },
};

const msg = {
  row:        { display:'flex', gap:10, maxWidth:800, width:'100%', margin:'0 auto' },
  rowUser:    { flexDirection:'row-reverse' },
  avatar:     { width:28, height:28, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--mono)', fontSize:9, fontWeight:700, flexShrink:0, marginTop:3 },
  avatarAI:   { background:'var(--ac-dim)', color:'var(--ac)', border:'1px solid var(--br-ac)' },
  avatarUser: { background:'var(--bg5)', color:'var(--tx2)', border:'1px solid var(--br2)' },
  bubble:     { background:'var(--bg3)', border:'1px solid var(--br)', borderRadius:11, padding:'11px 14px', fontSize:13, lineHeight:1.72, color:'var(--tx)', maxWidth:'calc(100% - 42px)' },
  bubbleUser: { background:'var(--bg4)' },
  typing:     { display:'flex', alignItems:'center', gap:5, padding:'2px 0' },
  dot:        { width:5, height:5, borderRadius:'50%', background:'var(--ac)', display:'inline-block', animation:'blink 1.2s ease-in-out infinite' },
  thinkTxt:   { fontSize:11.5, color:'var(--tx3)', marginLeft:4, fontStyle:'italic' },
};

const wl = {
  wrap:        { display:'flex', flexDirection:'column', alignItems:'center', padding:'28px 16px 40px', maxWidth:740, margin:'0 auto', width:'100%', position:'relative' },
  logo:        { width:56, height:56, borderRadius:16, background:'var(--ac-dim)', border:'1.5px solid var(--br-ac)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16, boxShadow:'0 0 24px var(--ac-glow)', animation:'pcPulse 3s ease-in-out infinite' },
  logoTxt:     { fontFamily:'var(--mono)', fontWeight:800, fontSize:20, color:'var(--ac)', letterSpacing:'-0.5px' },
  title:       { fontSize:28, fontWeight:800, marginBottom:7, textAlign:'center', color:'var(--tx)' },
  sub:         { fontSize:13.5, color:'var(--tx2)', marginBottom:26, textAlign:'center', lineHeight:1.6 },
  grid:        { display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, width:'100%', marginBottom:24 },
  card:        { background:'var(--bg3)', border:'1px solid var(--br)', borderRadius:11, padding:'14px 15px', cursor:'pointer', transition:'all .2s' },
  cardIcon:    { fontSize:18, marginBottom:6 },
  cardTitle:   { fontSize:13, fontWeight:600, color:'var(--tx)', marginBottom:3 },
  cardDesc:    { fontSize:11.5, color:'var(--tx3)', lineHeight:1.5 },
  chipsLabel:  { fontSize:11, color:'var(--tx3)', marginBottom:9, alignSelf:'flex-start' },
  chips:       { display:'flex', flexWrap:'wrap', gap:7, width:'100%' },
  chip:        { padding:'6px 13px', background:'var(--bg3)', border:'1px solid var(--br)', borderRadius:20, fontSize:12, color:'var(--tx2)', cursor:'pointer', transition:'all .2s' },
  watermark:   { position:'absolute', top:20, right:20, fontFamily:'var(--mono)', fontSize:32, fontWeight:800, color:'rgba(24,201,110,0.05)', userSelect:'none', pointerEvents:'none' },
};

const fmt = {
  root:       {},
  h3:         { fontSize:13.5, fontWeight:700, color:'var(--ac)', margin:'14px 0 6px', paddingBottom:5, borderBottom:'1px solid var(--br)' },
  p:          { margin:'4px 0', lineHeight:1.72 },
  li:         { margin:'3px 0 3px 18px', lineHeight:1.6, listStyleType:'disc' },
  badge:      { display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px', borderRadius:5, fontSize:12, fontFamily:'var(--mono)', fontWeight:500 },
  badgeTime:  { background:'rgba(24,201,110,0.12)', color:'var(--ac)', border:'1px solid rgba(24,201,110,0.22)' },
  badgeSpace: { background:'rgba(96,165,250,0.1)', color:'#93c5fd', border:'1px solid rgba(96,165,250,0.2)' },
  inlineCode: { fontFamily:'var(--mono)', fontSize:12, background:'var(--bg5)', padding:'1px 6px', borderRadius:4, color:'var(--ac)', border:'1px solid var(--br)' },
};

const cb = {
  wrap: { margin:'10px 0', borderRadius:9, overflow:'hidden', border:'1px solid var(--br)' },
  head: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 12px', background:'var(--bg5)', borderBottom:'1px solid var(--br)' },
  lang: { fontSize:11, fontFamily:'var(--mono)', color:'var(--tx3)' },
  copy: { fontSize:10.5, padding:'3px 9px', background:'var(--bg4)', border:'1px solid var(--br)', borderRadius:5, color:'var(--tx3)', cursor:'pointer', fontFamily:'var(--font)', transition:'color .15s' },
  body: { background:'var(--code-bg)', padding:'13px 15px', overflowX:'auto' },
  code: { fontFamily:'var(--mono)', fontSize:12.5, lineHeight:1.65, color:'#c9d1d9', whiteSpace:'pre' },
};
