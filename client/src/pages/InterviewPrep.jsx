import { useState } from 'react';
import Topbar from '../components/common/Topbar';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function InterviewPrep() {
  const [prep, setPrep] = useState(null);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('');
  const [mockMode, setMockMode] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState('');

  const generatePrep = async () => {
    if (!role.trim()) return toast.error('Enter a role first');
    setLoading(true);
    try {
      const res = await api.post('/ai/interview-prep', { job: { title: role, description: `Senior role requiring expertise in ${role}`, company: 'Target Company' } });
      setPrep(res.data.prep);
    } catch { toast.error('Failed to generate prep. Check API key.'); }
    setLoading(false);
  };

  const upcomingInterviews = [
    { company:'Razorpay', role:'Senior SWE', date:'May 18, 2026', time:'11:00 AM', type:'Technical Round 1', status:'Tomorrow' },
    { company:'Zomato', role:'Backend Lead', date:'May 21, 2026', time:'2:00 PM', type:'Final / Offer', status:'In 3 days' },
  ];

  const allQs = prep ? [...(prep.technical||[]), ...(prep.behavioral||[])] : [];

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1, overflow:'hidden' }}>
      <Topbar title="Interview Prep" subtitle="AI-powered preparation for your upcoming interviews" />
      <div style={{ flex:1, overflowY:'auto', padding:'18px 22px', display:'flex', flexDirection:'column', gap:14 }}>

        {/* Upcoming Interviews */}
        <div className="grid-2">
          {upcomingInterviews.map((iv,i) => (
            <div key={i} className="card" style={{ borderColor: i===0?'rgba(255,107,0,0.3)':undefined }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                <div style={{ fontFamily:'var(--font-display)', fontSize:15, fontWeight:700 }}>{iv.company}</div>
                <span className="badge badge-interview">{iv.status}</span>
              </div>
              <div style={{ fontSize:12, color:'var(--txt2)', marginBottom:10 }}>{iv.role} · {iv.type}</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginBottom:12, fontSize:11, color:'var(--txt3)' }}>
                <span>📅 {iv.date}</span><span>🕒 {iv.time}</span>
                <span>💻 {iv.type}</span><span>🎥 Google Meet</span>
              </div>
              <div style={{ display:'flex', gap:6 }}>
                <button className="btn btn-primary btn-sm" style={{ flex:1 }} onClick={() => { setRole(iv.role); generatePrep(); }}>🎤 Generate Prep</button>
                <button className="btn btn-ghost btn-sm" onClick={() => toast.info('Opening meet link...')}>Join Meet</button>
              </div>
            </div>
          ))}
        </div>

        {/* Generate Prep */}
        <div className="card">
          <div className="section-title">🤖 AI Interview Prep Generator</div>
          <div style={{ display:'flex', gap:8, marginBottom:16 }}>
            <input className="input" placeholder="Enter role (e.g. Senior Backend Engineer, SDE-2)" value={role} onChange={e=>setRole(e.target.value)} onKeyDown={e=>e.key==='Enter'&&generatePrep()} style={{ flex:1 }} />
            <button className="btn btn-primary" onClick={generatePrep} disabled={loading}>{loading?'Generating...':'Generate Prep Kit'}</button>
          </div>

          {prep && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <div>
                <div style={{ fontSize:12, fontWeight:600, color:'var(--accent)', marginBottom:8 }}>💻 Technical Questions</div>
                {(prep.technical||[]).map((q,i) => (
                  <div key={i} style={{ padding:'10px 12px', background:'var(--bg4)', borderRadius:8, marginBottom:6, fontSize:12, color:'var(--txt2)', border:'1px solid var(--border)', lineHeight:1.5 }}>{i+1}. {q}</div>
                ))}
              </div>
              <div>
                <div style={{ fontSize:12, fontWeight:600, color:'var(--info)', marginBottom:8 }}>🤝 Behavioral Questions</div>
                {(prep.behavioral||[]).map((q,i) => (
                  <div key={i} style={{ padding:'10px 12px', background:'var(--bg4)', borderRadius:8, marginBottom:6, fontSize:12, color:'var(--txt2)', border:'1px solid var(--border)', lineHeight:1.5 }}>{i+1}. {q}</div>
                ))}
              </div>
              {prep.tips && (
                <div style={{ gridColumn:'span 2', padding:'12px 14px', background:'rgba(255,107,0,0.06)', borderLeft:'3px solid var(--accent)', borderRadius:'0 8px 8px 0' }}>
                  <div style={{ fontSize:11, fontWeight:600, color:'var(--accent)', marginBottom:4 }}>💡 AI Tip</div>
                  <div style={{ fontSize:12, color:'var(--txt2)' }}>{prep.tips}</div>
                </div>
              )}
              {!mockMode && (
                <div style={{ gridColumn:'span 2' }}>
                  <button className="btn btn-primary" style={{ width:'100%' }} onClick={() => { setMockMode(true); setCurrentQ(0); setAnswer(''); }}>🎤 Start Mock Interview Session</button>
                </div>
              )}
            </div>
          )}

          {mockMode && allQs.length > 0 && (
            <div style={{ marginTop:16, padding:16, background:'var(--bg4)', borderRadius:10, border:'1px solid var(--border)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                <div style={{ fontSize:11, color:'var(--txt3)', fontFamily:'var(--font-mono)' }}>Question {currentQ+1} of {allQs.length}</div>
                <button className="btn btn-ghost btn-sm" onClick={() => setMockMode(false)}>Exit Mock</button>
              </div>
              <div style={{ fontSize:14, fontWeight:500, color:'var(--txt)', marginBottom:12, lineHeight:1.6 }}>{allQs[currentQ]}</div>
              <textarea className="input" placeholder="Type your answer here..." value={answer} onChange={e=>setAnswer(e.target.value)} style={{ height:100, resize:'vertical', marginBottom:10 }} />
              <div style={{ display:'flex', gap:8 }}>
                <button className="btn btn-ghost btn-sm" disabled={currentQ===0} onClick={() => { setCurrentQ(q=>q-1); setAnswer(''); }}>← Prev</button>
                <button className="btn btn-primary btn-sm" onClick={() => { if (currentQ<allQs.length-1) { setCurrentQ(q=>q+1); setAnswer(''); } else { setMockMode(false); toast.success('Mock interview complete! Great practice 🎉'); } }}>
                  {currentQ<allQs.length-1 ? 'Next →' : '✅ Finish'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Interview history */}
        <div className="card">
          <div className="section-title">📚 Past Interviews</div>
          {[
            {co:'Google',role:'SWE',round:'Technical 2',date:'May 10',outcome:'Rejected'},
            {co:'PhonePe',role:'Platform Eng',round:'HR Round',date:'May 8',outcome:'On Hold'},
            {co:'Freshworks',role:'SDE-2',round:'Final Round',date:'May 5',outcome:'Selected ✅'},
          ].map((iv,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 0', borderBottom: i<2?'1px solid var(--border)':undefined }}>
              <div style={{ width:32, height:32, borderRadius:8, background:'var(--bg4)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:13, color:'var(--txt3)' }}>{iv.co[0]}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, fontWeight:500, color:'var(--txt)' }}>{iv.co} — {iv.role}</div>
                <div style={{ fontSize:11, color:'var(--txt3)' }}>{iv.round} · {iv.date}</div>
              </div>
              <span className={`badge badge-${iv.outcome==='Rejected'?'rejected':iv.outcome==='Selected ✅'?'shortlisted':'viewed'}`}>{iv.outcome}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
