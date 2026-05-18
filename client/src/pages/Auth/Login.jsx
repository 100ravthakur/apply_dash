import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Fill in all fields');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
      toast.success('Welcome back!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>
      {/* Left panel */}
      <div style={{ flex: 1, background: 'var(--bg2)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 50%, rgba(255,107,0,0.08) 0%, transparent 60%)' }} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 380 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 800, color: 'var(--txt)', lineHeight: 1.1, marginBottom: 16 }}>Apply to <span style={{ color: 'var(--accent)' }}>30 Jobs</span> Daily. Automatically.</div>
          <div style={{ fontSize: 15, color: 'var(--txt2)', lineHeight: 1.7, marginBottom: 32 }}>AutoApply Pro finds, tailors, and submits job applications while you focus on what matters.</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
            {['🤖 AI-powered job matching & scoring', '✍️ Auto-tailored resumes per job', '📊 Apply across LinkedIn, Indeed, Naukri', '🎯 Interview prep with Claude AI'].map(f => (
              <div key={f} style={{ fontSize: 13, color: 'var(--txt2)', display: 'flex', alignItems: 'center', gap: 8 }}>{f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div style={{ width: 420, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
        <div style={{ width: '100%', maxWidth: 360 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <div style={{ width: 36, height: 36, background: 'var(--accent)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: '#fff' }}>A</div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>AutoApply Pro</div>
              <div style={{ fontSize: 11, color: 'var(--txt3)', fontFamily: 'var(--font-mono)' }}>Sign in to your account</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="input-label">Email address</label>
              <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} required />
            </div>
            <div>
              <label className="input-label">Password</label>
              <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '11px', fontSize: 14, marginTop: 4 }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--txt2)' }}>
            Don't have an account? <Link to="/register" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Create one free</Link>
          </div>

          <div style={{ marginTop: 24, padding: 12, background: 'var(--bg3)', borderRadius: 8, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, color: 'var(--txt3)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>DEMO CREDENTIALS</div>
            <div style={{ fontSize: 12, color: 'var(--txt2)' }}>Email: <span style={{ color: 'var(--accent)' }}>demo@autoapply.pro</span></div>
            <div style={{ fontSize: 12, color: 'var(--txt2)' }}>Password: <span style={{ color: 'var(--accent)' }}>demo123</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
