'use client';

export default function TopBar({ subtitle, level, setLevel, profile, onProfile, onNewChat }) {
  const initials = (profile?.full_name || profile?.email || 'PC').slice(0, 2).toUpperCase();

  return (
    <header style={s.bar}>
      <div style={s.left}>
        <button style={s.newBtn} onClick={onNewChat} title="Start a new chat">
          + New chat
        </button>
        <div style={s.meta}>
          <div style={s.title}>PC DSA Mentor</div>
          <div style={s.sub} title={subtitle}>{subtitle}</div>
        </div>
      </div>

      <div style={s.right}>
        {/* Level picker */}
        <div style={s.levels}>
          {['Beginner', 'Intermediate', 'Advanced'].map(l => (
            <button
              key={l}
              style={{ ...s.lvl, ...(level === l ? s.lvlActive : {}) }}
              onClick={() => setLevel(l)}
            >{l}</button>
          ))}
        </div>

        {/* Avatar / profile */}
        <button style={s.avatar} onClick={onProfile} title="Your profile">
          {initials}
        </button>
      </div>
    </header>
  );
}

const s = {
  bar:      { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 18px', borderBottom:'1px solid var(--br)', background:'var(--bg2)', flexShrink:0, gap:12, minHeight:52 },
  left:     { display:'flex', alignItems:'center', gap:11, minWidth:0 },
  newBtn:   { padding:'6px 12px', background:'var(--bg4)', border:'1px solid var(--br2)', borderRadius:7, color:'var(--tx2)', fontSize:12, fontWeight:500, whiteSpace:'nowrap', flexShrink:0, transition:'all .15s' },
  meta:     { minWidth:0 },
  title:    { fontSize:13.5, fontWeight:700, color:'var(--tx)', lineHeight:1.2 },
  sub:      { fontSize:11, color:'var(--tx3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:320 },

  right:    { display:'flex', alignItems:'center', gap:10, flexShrink:0 },
  levels:   { display:'flex', gap:3, background:'var(--bg4)', padding:3, borderRadius:8 },
  lvl:      { padding:'5px 11px', borderRadius:5, border:'none', background:'transparent', color:'var(--tx3)', fontSize:11.5, fontWeight:500, cursor:'pointer', transition:'all .2s' },
  lvlActive:{ background:'var(--ac)', color:'#fff' },

  avatar:   { width:32, height:32, borderRadius:8, background:'var(--ac-dim)', border:'1px solid var(--br-ac)', color:'var(--ac)', fontWeight:700, fontFamily:'var(--mono)', fontSize:11, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
};
