import { useState, useEffect, useRef } from 'react';
import Topbar from '../components/common/Topbar';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const LOGS_MOCK = [
  { time:'Just now', msg:'Fetching jobs from LinkedIn, Indeed, Remotive...', type:'info' },
];

export default function AutoApply() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [recentApps, setRecentApps] = useState([]);
  const [logs, setLogs] = useState([]);
  const navigate = useNavigate();
  const pollRef = useRef(null);

  useEffect(() => {
    fetchStatus();
    api.get('/profile').then(r => setProfile(r.data.profile)).catch(() => {});
    api.get('/applications?limit=5').then(r => setRecentApps(r.data.applications || [])).catch(() => {});
    return () => clearInterval(pollRef.current);
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await api.get('/auto-apply/status');
      setStatus(res.data);
    } catch {}
  };

  const startAutoApply = async () => {
    if (!profile?.resumeText) {
      toast.error('Upload your resume first!');
      navigate('/resume');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auto-apply/start');
      toast.success(res.data.message || 'Auto-apply started!');
      setLogs([{ time: 'Now', msg: 'Auto-apply started — fetching real jobs...', type: 'info' }]);
      // Poll every 5 seconds
      pollRef.current = setInterval(async () => {
        const r = await api.get('/auto-apply/status').catch(() => null);
        if (r) {
          setStatus(r.data);
          if (!r.data.isRunning) {
            clearInterval(pollRef.current);
            toast.success('Auto-apply session complete!');
            api.get('/applications?limit=5').then(a => setRecentApps(a.data.applications || [])).catch(() => {});
          }
        }
      }, 5000);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to start');
    } finally { setLoading(false); }
  };

  const stopAutoApply = async () => {
    try {
      await api.post('/auto-apply/stop');
      clearInterval(pollRef.current);
      toast.success('Auto-apply stopped');
      fetchStatus();
    } catch (e) { toast.error('Error stopping'); }
  };

  const isRunning = status?.isRunning;
  const hasResume = !!profile?.resumeText;

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1, overflow:'hidden' }}>
      <Topbar title="Auto-Apply Engine" subtitle="AI reads your resume → finds jobs → applies with cover letters" />
      <div style={{ flex:1, overflowY:'auto', padding:'18px 22px', display:'flex', flexDirection:'column', gap:14 }}>

        {/* Main control */}
        <div className="card" style={{ background: isRunning ? 'linear-gradient(135deg, rgba(63,185,80,0.06), rgba(63,185,80,0.02))' : 'var(--bg3)', borderColor: isRunning ? 'rgba(63,185,80,0.25)' : 'var(--border)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ width:60, height:60, borderRadius:'50%', background: isRunning ? 'rgba(63,185,80,0.12)' : 'rgba(255,107,0,0.1)', border: `2px solid ${isRunning ? 'rgba(63,185,80,0.4)' : 'rgba(255,107,0,0.3)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, animation: isRunning ? 'pulse 2s infinite' : 'none' }}>
              {isRunning ? '🤖' : '⚡'}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:'var(--font-display)', fontSize:16, fontWeight:700, color:'var(--txt)' }}>
                {isRunning ? `Applying... ${status?.status?.replace(/_/g,' ')}` : 'Auto-Apply Engine'}
              </div>
              <div style={{ fontSize:12, color:'var(--txt2)', marginTop:2 }}>
                {isRunning
                  ? `${status?.count || 0} applied · ${status?.jobsFound || 0} jobs found · targeting ${status?.target || 0} total`
                  : `${status?.todayCount || 0}/${status?.dailyLimit || 30} applied today · ${hasResume ? 'Resume ready ✅' : '⚠️ Upload resume to start'}`}
              </div>
              {isRunning && (
                <div className="progress" style={{ marginTop:8, height:6 }}>
                  <div className="progress-fill progress-fill-green" style={{ width:`${Math.min(((status?.count||0)/(status?.target||1))*100, 100)}%` }} />
                </div>
              )}
            </div>
            <div style={{ display:'flex', gap:8 }}>
              {!hasResume && (
                <button className="btn btn-ghost" onClick={() => navigate('/resume')}>Upload Resume →</button>
              )}
              {isRunning
                ? <button className="btn btn-danger" onClick={stopAutoApply}>⏹ Stop</button>
                : <button className="btn btn-primary btn-lg" onClick={startAutoApply} disabled={loading || !hasResume}>
                    {loading ? '⏳ Starting...' : '▶ Start Auto-Apply'}
                  </button>
              }
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid-4">
          {[
            {l:'Applied Today', v:status?.todayCount||0, c:'var(--accent)', icon:'📊'},
            {l:'Daily Limit', v:status?.dailyLimit||30, c:'var(--txt)', icon:'🎯'},
            {l:'Resume ATS', v:profile?.atsScore?`${profile.atsScore}%`:'—', c:profile?.atsScore>=75?'var(--success)':'var(--warn)', icon:'📄'},
            {l:'Profile Strength', v:profile?.profileStrength?`${profile.profileStrength}%`:'—', c:'var(--info)', icon:'💪'},
          ].map((s,i) => (
            <div key={i} className="stat-card">
              <div style={{ position:'absolute', top:12, right:12, fontSize:16 }}>{s.icon}</div>
              <div className="stat-label">{s.l}</div>
              <div className="stat-value" style={{ fontSize:20, color:s.c }}>{s.v}</div>
            </div>
          ))}
        </div>

        <div className="grid-2">
          {/* How it works / settings */}
          <div className="card">
            <div className="section-title">⚙️ Auto-Apply Settings</div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {[
                {l:'Resume Uploaded', v: hasResume ? `✅ ${profile?.resumeFileName||'Uploaded'}` : '❌ Not uploaded', ok: hasResume},
                {l:'Target Roles', v: profile?.preferences?.targetRoles?.slice(0,2).join(', ')||'Not set — upload resume', ok: profile?.preferences?.targetRoles?.length > 0},
                {l:'Daily Limit', v:`${profile?.preferences?.dailyApplyCount||30} applications`, ok: true},
                {l:'Job Sources', v:'Remotive, LinkedIn, Indeed', ok: true},
                {l:'AI Cover Letters', v:'Auto-generated per job ✅', ok: true},
                {l:'Min Match Score', v:'55% and above', ok: true},
              ].map((s,i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 10px', background:'var(--bg4)', borderRadius:7, border:'1px solid var(--border)' }}>
                  <span style={{ fontSize:12, color:'var(--txt2)' }}>{s.l}</span>
                  <span style={{ fontSize:12, fontWeight:500, color: s.ok ? 'var(--txt)' : 'var(--warn)' }}>{s.v}</span>
                </div>
              ))}
            </div>
            {!hasResume && (
              <button className="btn btn-primary" style={{ width:'100%', marginTop:12 }} onClick={() => navigate('/resume')}>
                📤 Upload Resume to Enable →
              </button>
            )}
          </div>

          {/* Recent applications */}
          <div className="card">
            <div className="section-title">📋 Recent Auto-Applied</div>
            {recentApps.length === 0 ? (
              <div style={{ textAlign:'center', padding:'24px 0', color:'var(--txt3)', fontSize:12 }}>
                No applications yet.<br/>Start auto-apply to see results here.
              </div>
            ) : recentApps.map((app, i) => (
              <div key={app._id||i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom: i<recentApps.length-1?'1px solid var(--border)':undefined }}>
                <div style={{ width:28, height:28, borderRadius:7, background:'rgba(255,107,0,0.1)', border:'1px solid rgba(255,107,0,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:12, color:'var(--accent)', flexShrink:0 }}>{(app.company||'?')[0]}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:500, color:'var(--txt)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{app.jobTitle}</div>
                  <div style={{ fontSize:10, color:'var(--txt3)' }}>{app.company} · {app.location||'Remote'}</div>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <span className={`badge badge-${app.status}`}>{app.status}</span>
                  <div style={{ fontSize:10, color:'var(--accent)', fontFamily:'var(--font-mono)', marginTop:2 }}>{app.matchScore}%</div>
                </div>
              </div>
            ))}
            {recentApps.length > 0 && (
              <button className="btn btn-ghost btn-sm" style={{ width:'100%', marginTop:10 }} onClick={() => navigate('/applications')}>
                View All Applications →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
