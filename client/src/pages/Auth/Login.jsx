import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || '';

// Dynamically load Google Identity Services script
const loadGoogleScript = () => {
  return new Promise((resolve) => {
    if (window.google?.accounts) return resolve();
    if (document.getElementById('google-gsi')) {
      const existing = document.getElementById('google-gsi');
      existing.addEventListener('load', resolve);
      return;
    }
    const s = document.createElement('script');
    s.id = 'google-gsi';
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.defer = true;
    s.onload = resolve;
    document.head.appendChild(s);
  });
};

export default function Login() {
  const { login, googleLogin, githubLogin } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState('');
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  // Handle GitHub OAuth callback code from URL
  useEffect(() => {
    const code = searchParams.get('github_code');
    const error = searchParams.get('error');
    if (error) {
      toast.error('OAuth login failed');
      setSearchParams({}, { replace: true });
      return;
    }
    if (code) {
      setSearchParams({}, { replace: true });
      setOauthLoading('github');
      githubLogin(code)
        .then(() => { navigate('/dashboard'); toast.success('Welcome!'); })
        .catch(err => toast.error(err.response?.data?.message || 'GitHub login failed'))
        .finally(() => setOauthLoading(''));
    }
  }, []);

  // Initialize Google One Tap / Button
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    loadGoogleScript().then(() => {
      if (!window.google?.accounts) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        auto_select: false,
      });
      const btnDiv = document.getElementById('google-signin-btn');
      if (btnDiv) {
        window.google.accounts.id.renderButton(btnDiv, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          width: 320,
          text: 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left',
        });
      }
    });
  }, []);

  const handleGoogleResponse = async (response) => {
    if (!response.credential) return toast.error('Google sign-in failed');
    setOauthLoading('google');
    try {
      await googleLogin(response.credential);
      navigate('/dashboard');
      toast.success('Welcome!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google login failed');
    } finally {
      setOauthLoading('');
    }
  };

  const handleGitHub = () => {
    if (!GITHUB_CLIENT_ID) return toast.error('GitHub OAuth not configured');
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const redirectUri = apiUrl
      ? `${apiUrl}/auth/github/callback`
      : `${window.location.origin}/api/auth/github/callback`;
    const url = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email`;
    window.location.href = url;
  };

  const submit = async e => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Email and password required');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
      toast.success('Welcome back!');
    } catch (err) { toast.error(err.response?.data?.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  const dividerStyle = { display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0' };
  const lineStyle = { flex: 1, height: 1, background: 'var(--border)' };
  const oauthBtnStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)',
    background: 'var(--bg2)', cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: 10, fontSize: 13, fontWeight: 500, color: 'var(--txt)',
    fontFamily: 'var(--font)', transition: 'all 0.15s',
  };

  const hasOAuth = GOOGLE_CLIENT_ID || GITHUB_CLIENT_ID;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>
      {/* Left */}
      <div style={{ flex: 1, background: 'var(--bg2)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 48px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '20%', left: '10%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 400, position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <div style={{ width: 36, height: 36, background: 'var(--accent)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: '#fff' }}>A</div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>AutoApply Pro</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 38, fontWeight: 800, color: 'var(--txt)', lineHeight: 1.1, marginBottom: 14, letterSpacing: '-0.03em' }}>
            Apply to <span style={{ color: 'var(--accent)' }}>30 jobs daily</span>.<br/>Automatically.
          </h1>
          <p style={{ fontSize: 14, color: 'var(--txt2)', lineHeight: 1.7, marginBottom: 28 }}>
            Upload your resume. AI reads it, finds matching jobs, writes personalized cover letters, and applies — all while you sleep.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {[
              ['📄', 'Upload resume → AI extracts your full profile'],
              ['🎯', 'AI scores each job against your skills (0-100%)'],
              ['✍️', 'Unique AI cover letter generated per application'],
              ['⚡', 'Auto-applies across LinkedIn, Indeed, Naukri, more'],
              ['📊', 'Track everything in real-time dashboard'],
            ].map(([icon, text]) => (
              <div key={text} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 15, flexShrink: 0 }}>{icon}</span>
                <span style={{ fontSize: 13, color: 'var(--txt2)', lineHeight: 1.5 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right */}
      <div style={{ width: 420, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ width: '100%', maxWidth: 360 }}>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>Sign in</h2>
            <p style={{ fontSize: 13, color: 'var(--txt2)' }}>Don't have an account? <Link to="/register" style={{ color: 'var(--accent)' }}>Create one free</Link></p>
          </div>

          {/* OAuth buttons */}
          {hasOAuth && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {GOOGLE_CLIENT_ID && (
                  <div id="google-signin-btn" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                    {/* Google Identity Services renders its button here */}
                  </div>
                )}
                {GITHUB_CLIENT_ID && (
                  <button onClick={handleGitHub} style={oauthBtnStyle} disabled={!!oauthLoading}
                    onMouseEnter={e => { e.target.style.background = 'var(--bg3)'; e.target.style.borderColor = 'var(--border2)'; }}
                    onMouseLeave={e => { e.target.style.background = 'var(--bg2)'; e.target.style.borderColor = 'var(--border)'; }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                    {oauthLoading === 'github' ? 'Connecting...' : 'Sign in with GitHub'}
                  </button>
                )}
              </div>
              <div style={dividerStyle}>
                <div style={lineStyle} />
                <span style={{ fontSize: 11, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>or continue with email</span>
                <div style={lineStyle} />
              </div>
            </>
          )}

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="input-label">Email address</label>
              <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} autoComplete="email" required />
            </div>
            <div>
              <label className="input-label">Password</label>
              <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} autoComplete="current-password" required />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 4 }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in →'}
            </button>
          </form>

          <div style={{ marginTop: 20, padding: 12, background: 'var(--bg3)', borderRadius: 8, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 10, color: 'var(--txt3)', fontFamily: 'var(--font-mono)', marginBottom: 5, letterSpacing: '0.06em' }}>FIRST TIME? REGISTER ABOVE</div>
            <div style={{ fontSize: 12, color: 'var(--txt2)' }}>After registering, upload your resume and the AI auto-fills your profile. Then hit Start Auto-Apply. Done.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
