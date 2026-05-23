'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ProfileModal({ profile, onClose, onSaved }) {
  const supabase = createClient();
  const router   = useRouter();

  const [name,    setName]    = useState(profile?.full_name || '');
  const [uname,   setUname]   = useState(profile?.username  || '');
  const [bio,     setBio]     = useState(profile?.bio       || '');
  const [level,   setLevel]   = useState(profile?.level_pref || 'Beginner');
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState('');

  const initials = (name || 'PC').slice(0, 2).toUpperCase();

  async function save() {
    setSaving(true); setMsg('');
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: name, username: uname, bio, level_pref: level, updated_at: new Date().toISOString() })
      .eq('id', profile.id);
    setSaving(false);
    if (error) { setMsg('❌ ' + error.message); return; }
    setMsg('✅ Saved!');
    onSaved({ ...profile, full_name: name, username: uname, bio, level_pref: level });
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push('/');
  }

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>

        {/* Header */}
        <div style={s.head}>
          <div style={s.bigAvatar}>{initials}</div>
          <div style={{ flex:1 }}>
            <div style={s.headName}>{name || 'Your Profile'}</div>
            <div style={s.headEmail}>{profile?.email}</div>
            <div style={s.headPC}>PC DSA Mentor</div>
          </div>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Fields */}
        <div style={s.body}>
          <div style={s.fieldGroup}>
            <label style={s.label}>Full Name</label>
            <input style={s.input} value={name} onChange={e => setName(e.target.value)} placeholder="Palak Chandak" />
          </div>

          <div style={s.fieldGroup}>
            <label style={s.label}>Username</label>
            <input style={s.input} value={uname} onChange={e => setUname(e.target.value)} placeholder="palakchandak8" />
          </div>

          <div style={s.fieldGroup}>
            <label style={s.label}>Bio</label>
            <textarea style={{ ...s.input, resize:'none', height:70 }} value={bio} onChange={e => setBio(e.target.value)} placeholder="Computer science student passionate about DSA…" />
          </div>

          <div style={s.fieldGroup}>
            <label style={s.label}>Default Difficulty</label>
            <div style={s.levelRow}>
              {['Beginner','Intermediate','Advanced'].map(l => (
                <button
                  key={l}
                  style={{ ...s.lvlBtn, ...(level === l ? s.lvlBtnActive : {}) }}
                  onClick={() => setLevel(l)}
                >{l}</button>
              ))}
            </div>
          </div>

          {msg && <div style={{ fontSize:12, color: msg.startsWith('✅') ? 'var(--ac)' : '#f87171', marginTop:4 }}>{msg}</div>}

          <button style={s.saveBtn} onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <button style={s.signOutBtn} onClick={signOut}>Sign Out</button>
        </div>

        {/* PC watermark */}
        <div style={s.watermark}>PC</div>
      </div>
    </div>
  );
}

const s = {
  overlay:    { position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999, backdropFilter:'blur(4px)' },
  modal:      { background:'var(--bg2)', border:'1px solid var(--br2)', borderRadius:14, width:400, maxHeight:'90vh', overflowY:'auto', position:'relative' },

  head:       { display:'flex', alignItems:'center', gap:12, padding:'18px 18px 14px', borderBottom:'1px solid var(--br)' },
  bigAvatar:  { width:46, height:46, borderRadius:12, background:'var(--ac-dim)', border:'1.5px solid var(--br-ac)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--mono)', fontWeight:700, fontSize:16, color:'var(--ac)', flexShrink:0, boxShadow:'0 0 12px var(--ac-glow)' },
  headName:   { fontSize:15, fontWeight:700, color:'var(--tx)' },
  headEmail:  { fontSize:11, color:'var(--tx3)', marginTop:1 },
  headPC:     { fontSize:10, color:'var(--ac)', fontFamily:'var(--mono)', fontWeight:600, marginTop:3 },
  closeBtn:   { background:'none', border:'none', color:'var(--tx3)', fontSize:14, padding:4, borderRadius:6, marginLeft:'auto', cursor:'pointer' },

  body:       { padding:'16px 18px', display:'flex', flexDirection:'column', gap:4 },
  fieldGroup: { marginBottom:8 },
  label:      { display:'block', fontSize:10.5, fontWeight:700, color:'var(--tx3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:5 },
  input:      { width:'100%', padding:'9px 11px', background:'var(--bg4)', border:'1px solid var(--br)', borderRadius:8, color:'var(--tx)', fontSize:13, outline:'none', fontFamily:'var(--font)' },

  levelRow:   { display:'flex', gap:6 },
  lvlBtn:     { flex:1, padding:'7px', borderRadius:7, border:'1px solid var(--br)', background:'var(--bg4)', color:'var(--tx3)', fontSize:12, fontWeight:500, cursor:'pointer' },
  lvlBtnActive:{ background:'var(--ac-dim)', border:'1px solid var(--br-ac)', color:'var(--ac)' },

  saveBtn:    { width:'100%', padding:'11px', background:'var(--ac)', border:'none', borderRadius:9, color:'#fff', fontSize:14, fontWeight:700, marginTop:10, cursor:'pointer' },
  signOutBtn: { width:'100%', padding:'10px', background:'transparent', border:'1px solid rgba(239,68,68,0.3)', borderRadius:9, color:'#f87171', fontSize:13, marginTop:8, cursor:'pointer' },

  watermark:  { position:'absolute', bottom:14, right:18, fontSize:11, fontFamily:'var(--mono)', fontWeight:700, color:'var(--ac-dim)', pointerEvents:'none', letterSpacing:'-0.5px' },
};
