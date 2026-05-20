import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { section: 'Main', items: [
    { to: '/dashboard', icon: '▤', label: 'Dashboard' },
    { to: '/auto-apply', icon: '⚡', label: 'Auto-Apply Engine', accent: true },
    { to: '/resume', icon: '📄', label: 'Resume & AI' },
  ]},
  { section: 'Track', items: [
    { to: '/jobs', icon: '💼', label: 'Job Queue' },
    { to: '/applications', icon: '📋', label: 'Applications' },
    { to: '/platforms', icon: '🔗', label: 'Platforms' },
  ]},
  { section: 'Tools', items: [
    { to: '/ai', icon: '🤖', label: 'AI Assistant' },
    { to: '/analytics', icon: '📊', label: 'Analytics' },
    { to: '/interviews', icon: '🎤', label: 'Interview Prep' },
    { to: '/companies', icon: '🏢', label: 'Companies' },
  ]},
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';

  return (
    <aside style={{ width: 210, minWidth: 210, background: 'var(--bg2)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: '100vh', flexShrink: 0 }}>

      {/* Logo */}
      <div style={{ padding: '14px 14px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 9 }}>
        <div style={{ width: 28, height: 28, background: 'var(--accent)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13, color: '#fff', flexShrink: 0 }}>A</div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--txt)', letterSpacing: '-0.02em' }}>AutoApply Pro</div>
          <div style={{ fontSize: 9, color: 'var(--txt3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>AI JOB ENGINE</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '6px 8px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {NAV.map(({ section, items }) => (
          <div key={section} style={{ marginBottom: 2 }}>
            <div style={{ fontSize: 9, color: 'var(--txt3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', padding: '9px 8px 3px', textTransform: 'uppercase', fontWeight: 600 }}>{section}</div>
            {items.map(({ to, icon, label, accent }) => (
              <NavLink key={to} to={to} style={{ textDecoration: 'none' }}>
                {({ isActive }) => (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '6px 9px', borderRadius: 7, cursor: 'pointer',
                    fontSize: 12.5, fontWeight: isActive ? 600 : 400, letterSpacing: '-0.01em',
                    color: isActive ? (accent ? 'var(--accent)' : 'var(--txt)') : 'var(--txt2)',
                    background: isActive ? (accent ? 'rgba(249,115,22,0.1)' : 'var(--bg3)') : 'transparent',
                    border: `1px solid ${isActive ? (accent ? 'rgba(249,115,22,0.2)' : 'var(--border)') : 'transparent'}`,
                    transition: 'all 0.12s', marginBottom: 1, position: 'relative',
                  }}>
                    {isActive && <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 2.5, height: 13, background: accent ? 'var(--accent)' : 'var(--txt2)', borderRadius: '0 2px 2px 0' }} />}
                    <span style={{ fontSize: 13 }}>{icon}</span>
                    <span style={{ flex: 1 }}>{label}</span>
                    {accent && !isActive && <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', animation: 'pulse 2s infinite' }} />}
                  </div>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '8px 10px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 3 }}>
        <NavLink to="/settings" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 9px', borderRadius: 7, color: 'var(--txt2)', fontSize: 12, cursor: 'pointer', transition: 'all 0.12s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg3)'; e.currentTarget.style.color = 'var(--txt)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--txt2)'; }}>
            <span>⚙️</span><span>Settings</span>
          </div>
        </NavLink>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 9px', borderRadius: 8, background: 'var(--bg3)', border: '1px solid var(--border)' }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent) 0%, #c2410c 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--txt)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>{user?.name}</div>
            <div style={{ fontSize: 9, color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{(user?.subscription || 'free').toUpperCase()}</div>
          </div>
          <button onClick={async () => { await logout(); navigate('/login'); }} style={{ background: 'none', border: 'none', color: 'var(--txt3)', cursor: 'pointer', fontSize: 14, transition: 'color 0.12s', padding: 2, display: 'flex' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--err)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--txt3)'}>↪</button>
        </div>
      </div>
    </aside>
  );
}
