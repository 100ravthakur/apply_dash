import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Briefcase, FileText, Link2, MessageSquare, BarChart3, Users, Building2, Settings, LogOut, Zap } from 'lucide-react';

const nav = [
  { section: 'Main', items: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', badge: 'LIVE', badgeGreen: true },
    { to: '/jobs', icon: Briefcase, label: 'Job Queue', badge: '30' },
    { to: '/applications', icon: FileText, label: 'Applications', badge: '247' },
    { to: '/platforms', icon: Link2, label: 'Platforms' },
  ]},
  { section: 'AI Tools', items: [
    { to: '/ai', icon: MessageSquare, label: 'AI Assistant' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  ]},
  { section: 'Prep', items: [
    { to: '/interviews', icon: Users, label: 'Interview Prep', badge: '2', badgeWarn: true },
    { to: '/companies', icon: Building2, label: 'Companies' },
  ]},
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <aside style={{ width: 220, minWidth: 220, background: 'var(--bg2)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: '100vh', flexShrink: 0 }}>
      {/* Logo */}
      <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, background: 'var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: '#fff', flexShrink: 0 }}>A</div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--txt)' }}>AutoApply Pro</div>
          <div style={{ fontSize: 10, color: 'var(--txt3)', fontFamily: 'var(--font-mono)' }}>v1.0 · {user?.subscription?.toUpperCase() || 'FREE'}</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
        {nav.map(({ section, items }) => (
          <div key={section}>
            <div style={{ fontSize: 10, color: 'var(--txt3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', padding: '10px 8px 5px', textTransform: 'uppercase' }}>{section}</div>
            {items.map(({ to, icon: Icon, label, badge, badgeGreen, badgeWarn }) => (
              <NavLink key={to} to={to} style={{ textDecoration: 'none' }}>
                {({ isActive }) => (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
                    fontSize: 13, color: isActive ? 'var(--accent)' : 'var(--txt2)',
                    background: isActive ? 'var(--accent-glow)' : 'transparent',
                    border: isActive ? '1px solid rgba(255,107,0,0.2)' : '1px solid transparent',
                    position: 'relative', transition: 'all 0.15s', marginBottom: 1,
                  }}>
                    {isActive && <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 3, height: 16, background: 'var(--accent)', borderRadius: '0 2px 2px 0' }} />}
                    <Icon size={15} style={{ opacity: isActive ? 1 : 0.65, flexShrink: 0 }} />
                    <span style={{ flex: 1 }}>{label}</span>
                    {badge && (
                      <span style={{
                        background: badgeGreen ? 'var(--success)' : badgeWarn ? 'rgba(255,184,0,0.8)' : 'var(--accent)',
                        color: '#fff', fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 9,
                        fontFamily: 'var(--font-mono)',
                      }}>{badge}</span>
                    )}
                  </div>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Settings & User */}
      <div style={{ padding: 10, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <NavLink to="/settings" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 10px', borderRadius: 8, color: 'var(--txt2)', fontSize: 13, cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg3)'; e.currentTarget.style.color = 'var(--txt)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--txt2)'; }}>
            <Settings size={15} style={{ opacity: 0.65 }} />
            <span>Settings</span>
          </div>
        </NavLink>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, background: 'var(--bg3)', cursor: 'pointer', position: 'relative' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), #FF4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--txt)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'User'}</div>
            <div style={{ fontSize: 10, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{user?.subscription?.toUpperCase() || 'FREE'}</div>
          </div>
          <button onClick={handleLogout} title="Logout" style={{ background: 'transparent', border: 'none', color: 'var(--txt3)', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--err)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--txt3)'}>
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </aside>
  );
}
