import { useState, useEffect } from 'react';
import Topbar from '../components/common/Topbar';
import api from '../services/api';
import toast from 'react-hot-toast';

const PLATFORM_META = {
  linkedin: { name: 'LinkedIn', desc: "World's largest professional network", icon: 'in', tips: 'Most responses from LinkedIn. Enable Easy Apply for best results.' },
  indeed: { name: 'Indeed', desc: 'Largest job search engine globally', icon: 'I', tips: 'Great for volume. Indeed Quick Apply works seamlessly.' },
  naukri: { name: 'Naukri', desc: "India's #1 job portal", icon: 'N', tips: 'Best for Indian companies. Keep your Naukri profile updated.' },
  glassdoor: { name: 'Glassdoor', desc: 'Jobs + company culture & salary reviews', icon: 'G', tips: 'Good for researching companies before applying.' },
  cutshort: { name: 'Cutshort', desc: 'AI-powered startup hiring platform', icon: '✂', tips: 'Great for startup roles. Profile matching is very precise.' },
  angel: { name: 'AngelList / Wellfound', desc: 'Startup jobs with equity information', icon: '🚀', tips: 'Best platform for equity + startup culture jobs.' },
};

export default function Platforms() {
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // platform id
  const [creds, setCreds] = useState({ email: '', password: '' });
  const [connecting, setConnecting] = useState(false);

  const fetchPlatforms = async () => {
    try {
      const res = await api.get('/platforms');
      setPlatforms(res.data.platforms || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchPlatforms(); }, []);

  const connect = async e => {
    e.preventDefault();
    if (!creds.email || !creds.password) return toast.error('Email and password required');
    setConnecting(true);
    try {
      const res = await api.post('/platforms/connect', { platform: modal, ...creds });
      toast.success(res.data.message || `${PLATFORM_META[modal].name} connected!`);
      setModal(null);
      setCreds({ email: '', password: '' });
      fetchPlatforms();
    } catch (err) { toast.error(err.response?.data?.message || 'Connection failed'); }
    finally { setConnecting(false); }
  };

  const disconnect = async pid => {
    if (!window.confirm(`Disconnect ${PLATFORM_META[pid].name}? Your credentials will be deleted.`)) return;
    try {
      await api.delete(`/platforms/${pid}`);
      toast.success('Disconnected');
      fetchPlatforms();
    } catch { toast.error('Error'); }
  };

  const togglePause = async (pid, status) => {
    try {
      await api[status === 'active' ? 'put' : 'put'](`/platforms/${pid}/${status === 'active' ? 'pause' : 'resume'}`);
      toast.success(status === 'active' ? 'Paused' : 'Resumed');
      fetchPlatforms();
    } catch { toast.error('Error'); }
  };

  const verify = async pid => {
    try {
      await api.post(`/platforms/${pid}/verify`);
      toast.success('Platform verified ✅');
      fetchPlatforms();
    } catch { toast.error('Verification failed'); }
  };

  const get = pid => platforms.find(p => p.platform === pid) || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <Topbar title="Platform Connections" subtitle="Connect job platforms — credentials encrypted with AES-256" />
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>

        {/* Security note */}
        <div className="info info-blue" style={{ marginBottom: 14 }}>
          🔒 <strong style={{ color: 'var(--txt)' }}>Bank-grade security:</strong> All credentials encrypted with AES-256-CBC before storage. Never sent to third parties. Used only to submit applications on your behalf.
        </div>

        {/* Platform grid */}
        <div className="g2" style={{ gap: 14 }}>
          {Object.entries(PLATFORM_META).map(([pid, meta]) => {
            const p = get(pid);
            const connected = p.isConnected;
            const active = p.status === 'active';
            const paused = p.status === 'paused';

            return (
              <div key={pid} className="card" style={{ borderColor: connected ? (active ? 'rgba(34,197,94,0.2)' : 'var(--border)') : 'var(--border)', transition: 'all 0.2s' }}>
                {/* Header */}
                <div className="between" style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className={`p-${pid}`} style={{ width: 38, height: 38, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{meta.icon}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--txt)' }}>{meta.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: connected ? (active ? 'var(--success)' : paused ? 'var(--warn)' : 'var(--txt3)') : 'var(--txt3)', display: 'inline-block' }} />
                        <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: connected ? (active ? 'var(--success)' : paused ? 'var(--warn)' : 'var(--txt3)') : 'var(--txt3)' }}>
                          {connected ? (active ? 'ACTIVE' : paused ? 'PAUSED' : p.status?.toUpperCase()) : 'NOT CONNECTED'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {!connected
                    ? <button className="btn btn-primary btn-sm" onClick={() => setModal(pid)}>Connect</button>
                    : <button className="btn btn-danger btn-sm" onClick={() => disconnect(pid)}>Disconnect</button>}
                </div>

                {/* Stats (if connected) */}
                {connected ? (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 12 }}>
                      {[
                        { l: 'Applied', v: p.totalApplied || 0 },
                        { l: 'Today', v: p.todayApplied || 0 },
                        { l: 'Last Active', v: p.lastSyncAt ? new Date(p.lastSyncAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—' },
                      ].map((s, i) => (
                        <div key={i} style={{ textAlign: 'center', padding: '7px 0', background: 'var(--bg4)', borderRadius: 6 }}>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--txt)' }}>{s.v}</div>
                          <div style={{ fontSize: 9, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-mono)' }}>{s.l}</div>
                        </div>
                      ))}
                    </div>

                    {p.profileEmail && (
                      <div style={{ fontSize: 11, color: 'var(--txt3)', marginBottom: 10 }}>
                        Logged in as <span style={{ color: 'var(--txt2)' }}>{p.profileEmail}</span>
                      </div>
                    )}

                    {p.errorMessage && (
                      <div className="info info-red" style={{ marginBottom: 10, fontSize: 11 }}>
                        ⚠️ {p.errorMessage}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => verify(pid)}>✓ Verify</button>
                      <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => togglePause(pid, p.status)}>
                        {active ? '⏸ Pause' : '▶ Resume'}
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setModal(pid)}>🔄</button>
                    </div>
                  </>
                ) : (
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--txt2)', marginBottom: 8 }}>{meta.desc}</div>
                    <div style={{ fontSize: 11, color: 'var(--txt3)', padding: '7px 10px', background: 'var(--bg4)', borderRadius: 6, border: '1px solid var(--border)' }}>
                      💡 {meta.tips}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* How it works */}
        <div className="card" style={{ marginTop: 14, padding: '14px 18px' }}>
          <div className="stitle">How platform connection works</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              ['1. Connect', 'Enter your login credentials — AES-256 encrypted before saving'],
              ['2. AI Applies', 'AutoApply reads your resume, finds matching jobs, and applies'],
              ['3. Track', 'All applications tracked in real-time in your dashboard'],
              ['4. Respond', 'Get shortlisted → you take over for interviews'],
            ].map(([t, d]) => (
              <div key={t} style={{ display: 'flex', gap: 9 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--accent-glow)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--accent)', flexShrink: 0 }}>{t[0]}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--txt)', marginBottom: 2 }}>{t}</div>
                  <div style={{ fontSize: 11, color: 'var(--txt3)' }}>{d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Connect Modal */}
      {modal && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <div className={`p-${modal}`} style={{ width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12 }}>{PLATFORM_META[modal].icon}</div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--txt)' }}>Connect {PLATFORM_META[modal].name}</div>
                  <div style={{ fontSize: 11, color: 'var(--txt3)' }}>Credentials stored with AES-256-CBC encryption</div>
                </div>
              </div>
            </div>

            <form onSubmit={connect} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              <div>
                <label className="input-label">Email / Username for {PLATFORM_META[modal].name}</label>
                <input className="input" type="email" placeholder="your@email.com" value={creds.email} onChange={e => setCreds(c => ({ ...c, email: e.target.value }))} required autoFocus />
              </div>
              <div>
                <label className="input-label">Password</label>
                <input className="input" type="password" placeholder="••••••••" value={creds.password} onChange={e => setCreds(c => ({ ...c, password: e.target.value }))} required />
              </div>
              <div className="info info-orange" style={{ fontSize: 11 }}>
                🔒 Your credentials are encrypted with AES-256-CBC before being stored. They are never sent to any third party and are only used to submit job applications on your behalf.
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => { setModal(null); setCreds({ email: '', password: '' }); }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={connecting}>{connecting ? 'Connecting...' : `Connect ${PLATFORM_META[modal].name}`}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
