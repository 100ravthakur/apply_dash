import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function Topbar({ title, subtitle, actions }) {
  const [botStatus, setBotStatus] = useState(null);

  useEffect(() => {
    api.get('/auto-apply/status').then(r => setBotStatus(r.data)).catch(() => {});
  }, []);

  const toggleBot = async () => {
    try {
      if (botStatus?.isRunning) {
        await api.post('/auto-apply/stop');
        setBotStatus(s => ({ ...s, isRunning: false }));
        toast.success('Auto-apply paused');
      } else {
        await api.post('/auto-apply/start');
        setBotStatus(s => ({ ...s, isRunning: true }));
        toast.success('Auto-apply started!');
      }
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
  };

  const running = botStatus?.isRunning;

  return (
    <header style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
      {/* Status bar */}
      <div style={{ padding: '5px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: 'var(--txt3)', fontFamily: 'var(--font-mono)', background: running ? 'rgba(34,197,94,0.04)' : undefined }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: running ? 'var(--success)' : 'var(--txt3)', display: 'inline-block', animation: running ? 'pulse 1.5s infinite' : 'none' }} />
          {running ? <span style={{ color: 'var(--success)' }}>Bot running — {botStatus?.session?.currentCompany || 'searching...'}</span> : 'Bot idle'}
        </span>
        <span style={{ color: 'var(--border2)' }}>·</span>
        <span>{botStatus?.todayCount || 0}<span style={{ color: 'var(--border2)' }}>/</span>{botStatus?.dailyLimit || 30} applied today</span>
        <span style={{ color: 'var(--border2)' }}>·</span>
        <span>Total: {botStatus?.total || 0}</span>
      </div>
      {/* Main */}
      <div style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--txt)', letterSpacing: '-0.02em' }}>{title}</div>
          {subtitle && <div style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 1 }}>{subtitle}</div>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {actions}
          <button onClick={toggleBot} className={`btn btn-sm ${running ? 'btn-danger' : 'btn-primary'}`}>
            {running ? '⏸ Stop Bot' : '▶ Start Bot'}
          </button>
        </div>
      </div>
    </header>
  );
}
