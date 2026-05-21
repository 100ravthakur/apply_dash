import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || '';

const loadGoogleScript = () => {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts) return resolve();
    if (document.getElementById('google-gsi')) {
      const existing = document.getElementById('google-gsi');
      existing.addEventListener('load', resolve);
      existing.addEventListener('error', reject);
      return;
    }
    const s = document.createElement('script');
    s.id = 'google-gsi';
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.defer = true;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
};

export default function Register() {
  const { register, googleLogin, githubLogin } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [form, setForm] = useState({ name: '', email: '', password: '', currentRole: '' });
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState('');
  const googleInitialized = useRef(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  // Handle GitHub OAuth callback
  useEffect(() => {
    const code = searchParams.get('github_code');
    const error = searchParams.get('error');
    if (error) {
      toast.error('OAuth sign-up failed');
      setSearchParams({}, { replace: true });
      return;
    }
    if (code) {
      setSearchParams({}, { replace: true });
      setOauthLoading('github');
      githubLogin(code)
        .then(() => { navigate('/resume'); toast.success('Account created! 🎉 Upload your resume to get started.'); })
        .catch(err => toast.error(err.response?.data?.message || 'GitHub sign-up failed'))
        .finally(() => setOauthLoading(''));
    }
  }, []);

  // Pre-load Google Identity Services script
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    loadGoogleScript().catch(() => {});
  }, []);

  const handleGoogleResponse = async (response) => {
    if (!response.credential) return toast.error('Google sign-up failed');
    setOauthLoading('google');
    try {
      await googleLogin(response.credential);
      navigate('/resume');
      toast.success('Account created! 🎉 Upload your resume to get started.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google sign-up failed');
    } finally { setOauthLoading(''); }
  };

  const handleGoogle = async () => {
    if (!GOOGLE_CLIENT_ID) {
      return toast.error('Google sign-in is not configured. Please set VITE_GOOGLE_CLIENT_ID.');
    }
    setOauthLoading('google');
    try {
      await loadGoogleScript();
      if (!window.google?.accounts) {
        toast.error('Google sign-in failed to load. Please try again.');
        setOauthLoading('');
        return;
      }
      if (!googleInitialized.current) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
          auto_select: false,
        });
        googleInitialized.current = true;
      }
      setOauthLoading('');
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          const tempDiv = document.createElement('div');
          tempDiv.style.position = 'fixed';
          tempDiv.style.top = '-9999px';
          document.body.appendChild(tempDiv);
          window.google.accounts.id.renderButton(tempDiv, {
            type: 'standard', theme: 'outline', size: 'large',
          });
          const btn = tempDiv.querySelector('[role="button"]') || tempDiv.querySelector('div[style]');
          if (btn) btn.click();
          setTimeout(() => document.body.removeChild(tempDiv), 100);
        }
      });
    } catch {
      toast.error('Failed to load Google sign-in. Check your connection.');
      setOauthLoading('');
    }
  };

  const handleGitHub = () => {
    if (!GITHUB_CLIENT_ID) {
      return toast.error('GitHub sign-in is not configured. Please set VITE_GITHUB_CLIENT_ID.');
    }
    setOauthLoading('github');
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const redirectUri = apiUrl
      ? `${apiUrl}/auth/github/callback`
      : `${window.location.origin}/api/auth/github/callback`;
    const url = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email&state=register`;
    window.location.href = url;
  };

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

  const dividerStyle = { display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0' };
  const lineStyle = { flex: 1, height: 1, background: 'var(--border)' };
  const oauthBtnStyle = (hovered) => ({
    width: '100%', padding: '11px 14px', borderRadius: 8, border: '1px solid var(--border)',
    background: hovered ? 'var(--bg3)' : 'var(--bg2)', cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 13, fontWeight: 500,
    color: 'var(--txt)', fontFamily: 'var(--font)', transition: 'all 0.15s',
    borderColor: hovered ? 'var(--border2)' : 'var(--border)',
    opacity: oauthLoading ? 0.7 : 1,
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 42, height: 42, background: 'var(--accent)', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: '#fff', margin: '0 auto 12px' }}>A</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>Create your account</h1>
          <p style={{ fontSize: 13, color: 'var(--txt2)' }}>Start applying to 30 jobs daily, automatically</p>
        </div>

        <div className="card" style={{ padding: 26 }}>
          {/* OAuth buttons — always visible */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <OAuthButton
              onClick={handleGoogle}
              disabled={!!oauthLoading}
              loading={oauthLoading === 'google'}
              icon={<GoogleIcon />}
              label="Sign up with Google"
              loadingLabel="Connecting..."
              style={oauthBtnStyle}
            />
            <OAuthButton
              onClick={handleGitHub}
              disabled={!!oauthLoading}
              loading={oauthLoading === 'github'}
              icon={<GitHubIcon />}
              label="Sign up with GitHub"
              loadingLabel="Connecting..."
              style={oauthBtnStyle}
            />
          </div>

          <div style={dividerStyle}>
            <div style={lineStyle} />
            <span style={{ fontSize: 11, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>or use email</span>
            <div style={lineStyle} />
          </div>

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

function OAuthButton({ onClick, disabled, loading, icon, label, loadingLabel, style }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      style={style(hovered)}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {icon}
      {loading ? loadingLabel : label}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  );
}
