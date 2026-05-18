import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function Topbar({ title, subtitle, extra }) {
  const [botRunning, setBotRunning] = useState(false);
  const [todayCount, setTodayCount] = useState(23);

  useEffect(() => {
    api.get('/automation/status').then(r => {
      setBotRunning(r.data.status === 'running');
      setTodayCount(r.data.todayCount || 23);
    }).catch(() => {});
  }, []);

  const toggleBot = async () => {
    try {
      if (botRunning) {
        await api.post('/automation/stop');
        setBotRunning(false);
        toast.success('Automation paused');
      } else {
        await api.post('/automation/start');
        setBotRunning(true);
        toast.success('Automation started!');
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error toggling automation');
    }
  };

  return (
    <div style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
      {/* Top indicator bar */}
      <div style={{ background: 'rgba(255,107,0,0.06)', borderBottom: '1px solid rgba(255,107,0,0.12)', padding: '6px 22px', display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: 'var(--txt2)', fontFamily: 'var(--font-mono)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: botRunning ? 'var(--success)' : 'var(--txt3)', display: 'inline-block', animation: botRunning ? 'pulse 1.5s infinite' : 'none' }} />
          {botRunning ? <span style={{ color: 'var(--accent)' }}>Bot running</span> : 'Bot stopped'}
        </span>
        <span>·</span>
        <span>Applied <span style={{ color: 'var(--txt)' }}>{todayCount}/30</span> today</span>
        <span>·</span>
        <span>Week 20 of 2026</span>
      </div>
      {/* Main topbar */}
      <div style={{ padding: '12px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--txt)' }}>{title}</div>
          {subtitle && <div style={{ fontSize: 11, color: 'var(--txt3)', fontFamily: 'var(--font-mono)', marginTop: 1 }}>{subtitle}</div>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {extra}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', background: botRunning ? 'rgba(0,200,150,0.08)' : 'rgba(85,85,85,0.15)', border: `1px solid ${botRunning ? 'rgba(0,200,150,0.22)' : 'var(--border)'}`, borderRadius: 20, fontSize: 11, color: botRunning ? 'var(--success)' : 'var(--txt3)', fontFamily: 'var(--font-mono)' }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: botRunning ? 'var(--success)' : 'var(--txt3)', display: 'inline-block' }} />
            {botRunning ? 'Running' : 'Stopped'}
          </div>
          <button className="btn btn-ghost btn-sm" onClick={toggleBot}>{botRunning ? '⏸ Pause' : '▶ Start'}</button>
          <button className="btn btn-primary btn-sm" onClick={() => toast.info('Manual apply — go to Job Queue')}>+ Apply</button>
          <button style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', color: 'var(--txt2)' }}>
            <Bell size={14} />
            <span style={{ position: 'absolute', top: 6, right: 6, width: 6, height: 6, background: 'var(--accent)', borderRadius: '50%' }} />
          </button>
        </div>
      </div>
    </div>
  );
}
