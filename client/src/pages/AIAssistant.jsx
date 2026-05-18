import { useState, useRef, useEffect } from 'react';
import Topbar from '../components/common/Topbar';
import api from '../services/api';

const QUICK = ['✍️ Write a cover letter for my last job', '📄 How can I improve my resume ATS score?', '🎤 Give me 5 system design interview questions', '💰 What salary should I negotiate for a Senior SWE role in Bangalore?', '🔍 What skills am I missing for a Staff Engineer role?', '📧 Write a follow-up email template'];

const initMsgs = [
  { role:'ai', text:`Hey! I'm your AI career assistant, powered by Claude.\n\nI have context of your profile, applications, and preferences. Ask me anything about your job search — cover letters, interview prep, salary negotiation, skill gaps, or company research.\n\nHow can I help today? 🚀` },
];

export default function AIAssistant() {
  const [msgs, setMsgs] = useState(initMsgs);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [msgs, loading]);

  const send = async (text) => {
    const msg = text?.trim() || input.trim();
    if (!msg || loading) return;
    setInput('');
    setMsgs(m => [...m, { role:'user', text:msg }]);
    setLoading(true);
    try {
      const res = await api.post('/ai/chat', { message: msg });
      setMsgs(m => [...m, { role:'ai', text: res.data.reply }]);
    } catch (err) {
      setMsgs(m => [...m, { role:'ai', text: err.response?.data?.message || '❌ Error reaching AI. Please check your ANTHROPIC_API_KEY in the .env file.' }]);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1, overflow:'hidden' }}>
      <Topbar title="AI Assistant" subtitle="Powered by Claude · Context-aware job search help" />
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', padding:'16px 22px', gap:12 }}>
        {/* Quick actions */}
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', flexShrink:0 }}>
          {QUICK.map((q,i) => (
            <button key={i} onClick={() => send(q)} style={{ padding:'5px 12px', borderRadius:6, fontSize:11, background:'rgba(255,107,0,0.07)', border:'1px solid rgba(255,107,0,0.2)', color:'var(--accent)', cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s' }}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(255,107,0,0.14)'}
              onMouseLeave={e=>e.currentTarget.style.background='rgba(255,107,0,0.07)'}>{q}</button>
          ))}
        </div>

        {/* Chat messages */}
        <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:16, padding:'4px 0' }}>
          {msgs.map((m,i) => (
            <div key={i} style={{ display:'flex', flexDirection: m.role==='user'?'row-reverse':'row', gap:10, alignItems:'flex-start' }}>
              <div style={{ width:30, height:30, borderRadius:'50%', background: m.role==='ai'?'rgba(255,107,0,0.12)':'linear-gradient(135deg,var(--accent),#FF4444)', border: m.role==='ai'?'1px solid rgba(255,107,0,0.25)':undefined, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, flexShrink:0, color: m.role==='ai'?'var(--accent)':'#fff', fontWeight:700 }}>
                {m.role==='ai' ? '🤖' : 'U'}
              </div>
              <div style={{ maxWidth:'75%', padding:'11px 14px', borderRadius: m.role==='ai'?'4px 12px 12px 12px':'12px 4px 12px 12px', fontSize:13, lineHeight:1.65, background: m.role==='ai'?'var(--bg3)':'var(--accent)', border: m.role==='ai'?'1px solid var(--border)':undefined, color: m.role==='ai'?'var(--txt)':'#fff', whiteSpace:'pre-wrap' }}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
              <div style={{ width:30, height:30, borderRadius:'50%', background:'rgba(255,107,0,0.12)', border:'1px solid rgba(255,107,0,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, flexShrink:0 }}>🤖</div>
              <div style={{ padding:'12px 14px', borderRadius:'4px 12px 12px 12px', background:'var(--bg3)', border:'1px solid var(--border)', display:'flex', gap:5, alignItems:'center' }}>
                {[0,1,2].map(i => <div key={i} style={{ width:7, height:7, borderRadius:'50%', background:'var(--txt3)', animation:`bounce 1.2s ${i*0.2}s infinite` }} />)}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ display:'flex', gap:8, borderTop:'1px solid var(--border)', paddingTop:12, flexShrink:0 }}>
          <input className="input" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&send()} placeholder="Ask anything — cover letters, interview prep, salary tips, skill gaps..." style={{ flex:1 }} />
          <button className="btn btn-primary" onClick={() => send()} disabled={loading || !input.trim()}>Send ↵</button>
        </div>
      </div>
      <style>{`@keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}`}</style>
    </div>
  );
}
