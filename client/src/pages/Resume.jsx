import { useState, useRef, useEffect } from 'react';
import Topbar from '../components/common/Topbar';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function ResumeUpload() {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [profile, setProfile] = useState(null);
  const fileRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/profile').then(r => setProfile(r.data.profile)).catch(() => {});
  }, []);

  const handleFile = async (file) => {
    if (!file) return;
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowed.includes(file.type)) return toast.error('Only PDF, DOCX, or TXT files allowed');
    if (file.size > 10 * 1024 * 1024) return toast.error('File must be under 10MB');

    setUploading(true);
    setAnalysis(null);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const res = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => console.log('Upload:', Math.round(e.loaded / e.total * 100) + '%'),
      });
      setAnalysis(res.data.analysis);
      setProfile(res.data.profile);
      toast.success('Resume analyzed! Profile auto-updated 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const scoreClass = (score) => score >= 75 ? 'score-high' : score >= 50 ? 'score-mid' : 'score-low';

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1, overflow:'hidden' }}>
      <Topbar title="Resume & AI Analysis" subtitle="Upload resume → AI extracts profile → Auto-apply begins" />
      <div style={{ flex:1, overflowY:'auto', padding:'18px 22px', display:'flex', flexDirection:'column', gap:14 }}>

        {/* Upload zone */}
        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)' }}>
            <div className="section-title" style={{ marginBottom:2 }}>📄 Resume Upload</div>
            <div style={{ fontSize:12, color:'var(--txt3)' }}>AI will read your resume and auto-fill your entire profile, skills, experience, and job preferences</div>
          </div>
          <div style={{ padding:20 }}>
            <div
              className={`upload-zone${dragging ? ' drag' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" style={{ display:'none' }} onChange={e => handleFile(e.target.files[0])} />
              {uploading ? (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
                  <div style={{ width:40, height:40, border:'3px solid var(--border)', borderTop:'3px solid var(--accent)', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
                  <div style={{ fontSize:14, fontWeight:600, color:'var(--txt)' }}>AI is reading your resume...</div>
                  <div style={{ fontSize:12, color:'var(--txt3)' }}>Extracting skills, experience, and preferences</div>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
                  <div style={{ fontSize:40 }}>{profile?.resumeFileName ? '✅' : '📤'}</div>
                  <div style={{ fontSize:14, fontWeight:600, color:'var(--txt)' }}>
                    {profile?.resumeFileName ? `Current: ${profile.resumeFileName}` : 'Drop your resume here'}
                  </div>
                  <div style={{ fontSize:12, color:'var(--txt3)' }}>PDF, DOCX, or TXT • Max 10MB • {profile?.resumeFileName ? 'Drop new file to update' : 'or click to browse'}</div>
                  {!profile?.resumeFileName && (
                    <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}>
                      Choose File
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Analysis results */}
        {analysis && (
          <div className="fade-in" style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div className="card" style={{ background:'linear-gradient(135deg, rgba(63,185,80,0.06), rgba(63,185,80,0.02))', borderColor:'rgba(63,185,80,0.2)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                <div className={`score-ring ${scoreClass(analysis.atsScore)}`}>{analysis.atsScore}%</div>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:'var(--txt)', fontFamily:'var(--font-display)' }}>ATS Score — {analysis.atsScore >= 75 ? 'Strong' : analysis.atsScore >= 50 ? 'Good' : 'Needs Work'}</div>
                  <div style={{ fontSize:12, color:'var(--txt2)', marginTop:2 }}>Profile auto-updated from your resume · {analysis.experience} positions extracted</div>
                </div>
                <button className="btn btn-primary" style={{ marginLeft:'auto' }} onClick={() => navigate('/jobs')}>
                  Find Jobs →
                </button>
              </div>
            </div>

            <div className="grid-2">
              <div className="card">
                <div className="section-title">💼 Extracted Skills</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                  {[...(analysis.skills?.technical||[]), ...(analysis.skills?.tools||[])].slice(0,16).map(s => (
                    <span key={s} style={{ padding:'3px 8px', background:'rgba(255,107,0,0.08)', border:'1px solid rgba(255,107,0,0.2)', borderRadius:5, fontSize:11, fontFamily:'var(--font-mono)', color:'var(--accent)' }}>{s}</span>
                  ))}
                </div>
              </div>
              <div className="card">
                <div className="section-title">🎯 Target Roles (AI Suggested)</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {(analysis.targetRoles||[]).map(r => (
                    <span key={r} style={{ padding:'5px 10px', background:'rgba(88,166,255,0.08)', border:'1px solid rgba(88,166,255,0.2)', borderRadius:6, fontSize:12, color:'var(--info)' }}>{r}</span>
                  ))}
                </div>
                <div style={{ marginTop:12 }}>
                  <div className="section-title" style={{ marginBottom:6 }}>⚡ Key Strengths</div>
                  {(analysis.keyStrengths||[]).map((s,i) => (
                    <div key={i} style={{ fontSize:12, color:'var(--txt2)', marginBottom:4, display:'flex', gap:6 }}>
                      <span style={{ color:'var(--success)' }}>✓</span> {s}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card" style={{ background:'rgba(255,107,0,0.04)', borderColor:'rgba(255,107,0,0.15)' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:'var(--txt)' }}>Ready to Auto-Apply? 🚀</div>
                  <div style={{ fontSize:12, color:'var(--txt2)', marginTop:2 }}>AI will find matching jobs and apply with personalized cover letters</div>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/auto-apply')}>Start Auto-Apply →</button>
              </div>
            </div>
          </div>
        )}

        {/* Profile summary if resume already uploaded */}
        {!analysis && profile?.resumeFileName && (
          <div className="card fade-in">
            <div className="section-title">📊 Current Profile</div>
            <div className="grid-2" style={{ marginBottom:12 }}>
              {[
                {l:'Role',v:profile.currentRole||'—'},{l:'Experience',v:profile.yearsOfExperience?`${profile.yearsOfExperience} years`:'—'},
                {l:'ATS Score',v:profile.atsScore?`${profile.atsScore}%`:'—'},{l:'Profile Strength',v:profile.profileStrength?`${profile.profileStrength}%`:'—'},
              ].map((m,i) => (
                <div key={i} style={{ padding:'10px 12px', background:'var(--bg4)', borderRadius:8, border:'1px solid var(--border)' }}>
                  <div style={{ fontSize:10, color:'var(--txt3)', fontFamily:'var(--font-mono)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{m.l}</div>
                  <div style={{ fontSize:14, fontWeight:600, color:'var(--txt)', marginTop:2 }}>{m.v}</div>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn btn-primary" onClick={() => navigate('/auto-apply')}>Start Auto-Apply →</button>
              <button className="btn btn-ghost" onClick={() => fileRef.current?.click()}>📤 Update Resume</button>
            </div>
            <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" style={{ display:'none' }} onChange={e => handleFile(e.target.files[0])} />
          </div>
        )}

        {/* How it works */}
        {!analysis && !profile?.resumeFileName && (
          <div className="card">
            <div className="section-title">🤖 How AI Auto-Apply Works</div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {[
                {n:'1', t:'Upload Resume', d:'PDF or DOCX — AI reads every detail', c:'var(--accent)'},
                {n:'2', t:'AI Extracts Profile', d:'Skills, experience, education auto-filled', c:'var(--info)'},
                {n:'3', t:'Job Matching', d:'Real jobs fetched and scored against your profile', c:'var(--purple)'},
                {n:'4', t:'Auto Apply', d:'AI writes unique cover letters and submits applications', c:'var(--success)'},
              ].map((s,i) => (
                <div key={i} style={{ display:'flex', gap:12, alignItems:'flex-start', padding:'10px 12px', background:'var(--bg4)', borderRadius:8, border:'1px solid var(--border)' }}>
                  <div style={{ width:28, height:28, borderRadius:'50%', background:`${s.c}20`, border:`1px solid ${s.c}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:s.c, flexShrink:0 }}>{s.n}</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:'var(--txt)' }}>{s.t}</div>
                    <div style={{ fontSize:11, color:'var(--txt3)', marginTop:2 }}>{s.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
