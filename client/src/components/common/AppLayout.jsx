import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Briefcase, FileText, Zap, BarChart3,
  Plug, Settings, LogOut, Bell, Search, ChevronRight
} from 'lucide-react';
import styled, { css } from 'styled-components';

// Using plain CSS-in-JS style approach with inline styles for compatibility

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', section: 'main' },
  { to: '/jobs', icon: Briefcase, label: 'Job Queue', badge: '30', section: 'main' },
  { to: '/applications', icon: FileText, label: 'Applications', badge: '247', section: 'main' },
  { to: '/ai-assistant', icon: Zap, label: 'AI Assistant', section: 'ai' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics', section: 'ai' },
  { to: '/platforms', icon: Plug, label: 'Platforms', section: 'system' },
  { to: '/settings', icon: Settings, label: 'Settings', section: 'system' },
];

const s = {
  layout: { display: 'flex', minHeight: '100vh', background: 'var(--bg)' },
  sidebar: { width: 220, minWidth: 220, background: 'var(--bg2)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 100 },
  logo: { padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 },
  logoIcon: { width: 32, height: 32, background: 'var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#fff' },
  nav: { flex: 1, padding: '12px 0', overflowY: 'auto' },
  section: { padding: '0 12px', marginBottom: 4 },
  sectionLabel: { fontSize: 9, color: 'var(--text3)', letterSpacing: '1.5px', fontWeight: 600, padding: '8px 8px 4px', textTransform: 'uppercase', display: 'block' },
  botStatus: { padding: 12, margin: 12, borderRadius: 10, background: 'rgba(0,200,150,0.08)', border: '1px solid rgba(0,200,150,0.2)', display: 'flex', alignItems: 'center', gap: 8 },
  main: { flex: 1, marginLeft: 220, display: 'flex', flexDirection: 'column', minHeight: '100vh' },
  topbar: { height: 56, background: 'var(--bg2)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 50 },
  content: { flex: 1, padding: 24, overflowY: 'auto' },
};

const BotDot = () => (
  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', animation: 'botPulse 2s infinite', flexShrink: 0 }} />
);

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [botApplied] = useState(22);

  return (
    <div style={s.layout}>
      {/* SIDEBAR */}
      <nav style={s.sidebar}>
        <div style={s.logo}>
          <div style={s.logoIcon}>⚡</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15 }}>AutoApply</div>
            <div style={{ fontSize: 9, color: 'var(--text2)', letterSpacing: '1px', fontWeight: 500, textTransform: 'uppercase' }}>Pro v1.0</div>
          </div>
        </div>

        <nav style={s.nav}>
          {['main', 'ai', 'system'].map(section => (
            <div key={section} style={s.section}>
              <span style={s.sectionLabel}>{section === 'ai' ? 'AI Tools' : section === 'system' ? 'System' : 'Main'}</span>
              {navItems.filter(n => n.section === section).map(({ to, icon: Icon, label, badge }) => (
                <NavLink
                  key={to}
                  to={to}
                  style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px',
                    borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500,
                    color: isActive ? 'var(--accent)' : 'var(--text2)',
                    background: isActive ? 'rgba(255,107,0,0.12)' : 'none',
                    border: isActive ? '1px solid rgba(255,107,0,0.2)' : '1px solid transparent',
                    marginBottom: 1, textDecoration: 'none', transition: 'all 0.2s',
                  })}
                >
                  <Icon size={16} />
                  <span style={{ flex: 1 }}>{label}</span>
                  {badge && (
                    <span style={{ background: 'var(--accent)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10, fontFamily: 'var(--font-mono)' }}>
                      {badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div style={s.botStatus}>
          <BotDot />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--success)' }}>Bot Running</div>
            <div style={{ fontSize: 10, color: 'var(--text2)' }}>3 platforms active</div>
          </div>
          <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text2)', flexShrink: 0 }}>
            {botApplied}/30
          </div>
        </div>

        <button
          onClick={logout}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', color: 'var(--text2)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, borderTop: '1px solid var(--border)', width: '100%', transition: 'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--error)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text2)'}
        >
          <LogOut size={15} />
          Sign out
        </button>
      </nav>

      {/* MAIN CONTENT */}
      <div style={s.main}>
        <div style={s.topbar}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>
            {user?.name ? `Good morning, ${user.name.split(' ')[0]} 👋` : 'AutoApply Pro'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text2)', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <Bell size={13} /> 3
            </button>
            <div
              style={{ width: 32, height: 32, background: 'linear-gradient(135deg, var(--accent), var(--accent2))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
              onClick={() => navigate('/settings')}
            >
              {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
            </div>
          </div>
        </div>

        <div style={s.content}>
          <Outlet />
        </div>
      </div>

      <style>{`
        @keyframes botPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(0,200,150,0.4); }
          50% { opacity: 0.8; box-shadow: 0 0 0 6px rgba(0,200,150,0); }
        }
      `}</style>
    </div>
  );
}
