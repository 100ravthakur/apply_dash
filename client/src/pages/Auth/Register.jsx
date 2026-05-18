import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', currentRole: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Fill all required fields');
    if (form.password.length < 6) return toast.error('Password must be 6+ characters');
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
      toast.success('Account created! Welcome to AutoApply Pro 🚀');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 44, height: 44, background: 'var(--accent)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: '#fff', margin: '0 auto 12px' }}>A</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800 }}>Create Your Account</div>
          <div style={{ fontSize: 13, color: 'var(--txt2)', marginTop: 4 }}>Start applying to 30 jobs daily, automatically</div>
        </div>

        <div className="card" style={{ padding: 28 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="input-label">Full Name *</label>
              <input className="input" placeholder="Arjun Reddy" value={form.name} onChange={set('name')} required />
            </div>
            <div>
              <label className="input-label">Email Address *</label>
              <input className="input" type="email" placeholder="arjun@example.com" value={form.email} onChange={set('email')} required />
            </div>
            <div>
              <label className="input-label">Current Role (optional)</label>
              <input className="input" placeholder="Software Engineer" value={form.currentRole} onChange={set('currentRole')} />
            </div>
            <div>
              <label className="input-label">Password * (min 6 chars)</label>
              <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '11px', fontSize: 14, marginTop: 8 }} disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account — It\'s Free →'}
            </button>
          </form>
          <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--txt2)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
