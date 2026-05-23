'use client';
import { useState } from 'react';
import { TOPICS } from '@/lib/constants';

export default function Sidebar({ panel, setPanel, onTopicSelect }) {
  const [open, setOpen] = useState(null);

  function toggle(i) {
    setOpen(open === i ? null : i);
    setPanel('chat');
  }

  return (
    <nav style={s.wrap}>
      {/* Brand */}
      <div style={s.brand}>
        <div style={s.pcBadge}>PC</div>
        <div>
          <div style={s.brandName}>DSA Mentor</div>
          <div style={s.brandSub}>by palakchandak8</div>
        </div>
      </div>

      {/* Panel toggle */}
      <div style={s.tabs}>
        <button
          style={{ ...s.tab, ...(panel === 'chat' ? s.tabActive : {}) }}
          onClick={() => setPanel('chat')}
        >Topics</button>
        <button
          style={{ ...s.tab, ...(panel === 'history' ? s.tabActive : {}) }}
          onClick={() => setPanel('history')}
        >History</button>
      </div>

      {/* Topic tree */}
      <div style={s.tree}>
        {TOPICS.map((t, i) => (
          <div key={t.name}>
            <div
              style={{ ...s.topicRow, ...(open === i ? s.topicRowOpen : {}) }}
              onClick={() => toggle(i)}
            >
              <div style={s.topicLeft}>
                <span style={{ ...s.dot, background: t.color }} />
                <span style={{ ...s.topicName, ...(open === i ? { color: 'var(--ac)' } : {}) }}>
                  {t.name}
                </span>
              </div>
              <span style={{ ...s.arrow, ...(open === i ? s.arrowOpen : {}) }}>›</span>
            </div>

            {open === i && (
              <div style={s.subs}>
                {t.subs.map(sub => (
                  <button
                    key={sub}
                    style={s.subBtn}
                    onClick={() => { onTopicSelect(t.name, sub); setPanel('chat'); }}
                  >
                    <span style={s.subDot} /> {sub}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={s.footer}>
        <div style={s.footerPc}>PC DSA Mentor</div>
        <a href="https://github.com/palakchandak8" target="_blank" style={s.footerLink}>
          github.com/palakchandak8
        </a>
        <a href="mailto:palak.chandak@somaiya.edu" style={s.footerMail}>
          palak.chandak@somaiya.edu
        </a>
      </div>
    </nav>
  );
}

const s = {
  wrap:       { width:'var(--sidebar-w)', minWidth:'var(--sidebar-w)', height:'100vh', background:'var(--bg2)', borderRight:'1px solid var(--br)', display:'flex', flexDirection:'column', overflow:'hidden' },
  brand:      { display:'flex', alignItems:'center', gap:9, padding:'14px 12px 12px', borderBottom:'1px solid var(--br)' },
  pcBadge:    { width:30, height:30, borderRadius:8, background:'var(--ac-dim)', border:'1px solid var(--br-ac)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--mono)', fontWeight:700, fontSize:11, color:'var(--ac)', flexShrink:0 },
  brandName:  { fontSize:12.5, fontWeight:700, color:'var(--tx)', lineHeight:1.3 },
  brandSub:   { fontSize:9.5, color:'var(--tx3)' },

  tabs:       { display:'flex', gap:4, padding:'8px 8px', borderBottom:'1px solid var(--br)' },
  tab:        { flex:1, padding:'5px', borderRadius:6, border:'none', background:'transparent', color:'var(--tx3)', fontSize:11.5, fontWeight:500, cursor:'pointer', transition:'all .15s' },
  tabActive:  { background:'var(--ac-dim)', color:'var(--ac)' },

  tree:       { flex:1, overflowY:'auto', padding:'6px 0' },
  topicRow:   { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 12px', cursor:'pointer', transition:'background .15s', userSelect:'none' },
  topicRowOpen:{ background:'var(--ac-dim)' },
  topicLeft:  { display:'flex', alignItems:'center', gap:8 },
  dot:        { width:6, height:6, borderRadius:'50%', flexShrink:0 },
  topicName:  { fontSize:12.5, fontWeight:500, color:'var(--tx2)' },
  arrow:      { fontSize:12, color:'var(--tx3)', transition:'transform .2s', display:'inline-block' },
  arrowOpen:  { transform:'rotate(90deg)' },
  subs:       { display:'flex', flexDirection:'column' },
  subBtn:     { display:'flex', alignItems:'center', gap:5, padding:'5px 12px 5px 26px', background:'none', border:'none', color:'var(--tx3)', fontSize:11.5, cursor:'pointer', textAlign:'left', transition:'color .15s' },
  subDot:     { width:3, height:3, borderRadius:'50%', background:'currentColor', flexShrink:0 },

  footer:     { padding:'10px 12px', borderTop:'1px solid var(--br)', display:'flex', flexDirection:'column', gap:2 },
  footerPc:   { fontSize:10, fontWeight:700, color:'var(--ac)', fontFamily:'var(--mono)', marginBottom:2 },
  footerLink: { fontSize:10.5, color:'var(--tx3)', transition:'color .15s' },
  footerMail: { fontSize:10.5, color:'var(--tx4)' },
};
