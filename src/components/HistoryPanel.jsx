'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

export default function HistoryPanel({ userId, onLoad, currentId }) {
  const supabase  = createClient();
  const [list,    setList]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [q,       setQ]       = useState('');

  useEffect(() => { if (userId) fetch_(); }, [userId, currentId]);

  async function fetch_() {
    setLoading(true);
    const { data } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(60);
    setList(data || []);
    setLoading(false);
  }

  async function del(id, e) {
    e.stopPropagation();
    await supabase.from('sessions').delete().eq('id', id);
    setList(l => l.filter(x => x.id !== id));
  }

  const filtered = list.filter(s => s.title.toLowerCase().includes(q.toLowerCase()));

  // Group by relative date
  function label(d) {
    const diff = (Date.now() - new Date(d)) / 86400000;
    if (diff < 1)  return 'Today';
    if (diff < 2)  return 'Yesterday';
    if (diff < 7)  return 'This Week';
    if (diff < 31) return 'This Month';
    return 'Older';
  }
  const ORDER = ['Today','Yesterday','This Week','This Month','Older'];
  const groups = {};
  filtered.forEach(s => { const g = label(s.updated_at); (groups[g] = groups[g] || []).push(s); });

  function levelColor(l) {
    return l === 'Beginner' ? '#18c96e' : l === 'Intermediate' ? '#f5c842' : '#f87171';
  }

  return (
    <div style={s.wrap}>
      {/* Search */}
      <div style={s.searchBar}>
        <input
          style={s.search}
          placeholder="🔍 Search history..."
          value={q}
          onChange={e => setQ(e.target.value)}
        />
      </div>

      <div style={s.list}>
        {loading && <div style={s.empty}>Loading…</div>}

        {!loading && filtered.length === 0 && (
          <div style={s.empty}>
            <div style={{ fontSize:28, marginBottom:8 }}>🗂️</div>
            <div style={{ fontWeight:600, marginBottom:4 }}>No history yet</div>
            <div style={{ fontSize:11, color:'var(--tx3)' }}>Ask a question to get started</div>
          </div>
        )}

        {ORDER.filter(g => groups[g]).map(grp => (
          <div key={grp}>
            <div style={s.grpLabel}>{grp}</div>
            {groups[grp].map(sess => (
              <div
                key={sess.id}
                style={{ ...s.item, ...(sess.id === currentId ? s.itemActive : {}) }}
                onClick={() => onLoad(sess)}
              >
                {/* Level dot */}
                <span style={{ ...s.lvlDot, background: levelColor(sess.level) }} />
                <div style={s.itemBody}>
                  <div style={s.itemTitle}>{sess.title}</div>
                  <div style={s.itemMeta}>
                    <span style={{ color: levelColor(sess.level), fontSize:10 }}>{sess.level}</span>
                    {sess.topic && <span style={s.topicTag}>{sess.topic}</span>}
                  </div>
                </div>
                <button style={s.delBtn} onClick={e => del(sess.id, e)} title="Delete">✕</button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const s = {
  wrap:      { display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' },
  searchBar: { padding:'8px 10px', borderBottom:'1px solid var(--br)' },
  search:    { width:'100%', padding:'7px 10px', background:'var(--bg4)', border:'1px solid var(--br)', borderRadius:7, color:'var(--tx)', fontSize:12, outline:'none' },
  list:      { flex:1, overflowY:'auto', padding:'4px 0' },
  empty:     { padding:'32px 16px', textAlign:'center', color:'var(--tx3)', fontSize:12.5 },
  grpLabel:  { padding:'8px 12px 3px', fontSize:9.5, fontWeight:700, color:'var(--tx3)', textTransform:'uppercase', letterSpacing:'0.07em' },
  item:      { display:'flex', alignItems:'center', gap:8, padding:'8px 10px', margin:'1px 5px', borderRadius:7, cursor:'pointer', transition:'background .15s' },
  itemActive:{ background:'var(--ac-dim)' },
  lvlDot:    { width:6, height:6, borderRadius:'50%', flexShrink:0 },
  itemBody:  { flex:1, minWidth:0 },
  itemTitle: { fontSize:12, color:'var(--tx)', fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:2 },
  itemMeta:  { display:'flex', alignItems:'center', gap:6 },
  topicTag:  { fontSize:10, color:'var(--tx3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
  delBtn:    { background:'none', border:'none', color:'var(--tx3)', fontSize:10, padding:'2px 5px', borderRadius:4, opacity:.5, flexShrink:0, cursor:'pointer' },
};
