import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', currentRole: '' });
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Fill all required fields');
    if (form.password.length < 6) return toast.error('Password must be 6+ characters');
    setLoading(true);
    try {
      await register(form);
      navigate('/resume');
      toast.success('Account created! 🎉 Now upload your resume to get started.');
    } catch (err) { toast.error(err.response?.data?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 42, height: 42, background: 'var(--accent)', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: '#fff', margin: '0 auto 12px' }}>A</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>Create your account</h1>
          <p style={{ fontSize: 13, color: 'var(--txt2)' }}>Start applying to 30 jobs daily, automatically</p>
        </div>

        <div className="card" style={{ padding: 26 }}>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="input-label">Full Name *</label>
              <input className="input" placeholder="Arjun Sharma" value={form.name} onChange={set('name')} required />
            </div>
            <div>
              <label className="input-label">Email Address *</label>
              <input className="input" type="email" placeholder="arjun@example.com" value={form.email} onChange={set('email')} required />
            </div>
            <div>
              <label className="input-label">Current Role <span style={{ color: 'var(--txt3)' }}>(optional)</span></label>
              <input className="input" placeholder="Software Engineer" value={form.currentRole} onChange={set('currentRole')} />
            </div>
            <div>
              <label className="input-label">Password * <span style={{ color: 'var(--txt3)' }}>min 6 characters</span></label>
              <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} required />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 4 }} disabled={loading}>
              {loading ? 'Creating account...' : 'Create account — free →'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--txt2)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--accent)' }}>Sign in</Link>
          </p>

          <div style={{ marginTop: 16, padding: 11, background: 'var(--bg4)', borderRadius: 7, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, color: 'var(--txt2)', lineHeight: 1.6 }}>
              🔒 After registering, you'll upload your resume → AI extracts your profile → auto-apply begins. No manual form filling.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
