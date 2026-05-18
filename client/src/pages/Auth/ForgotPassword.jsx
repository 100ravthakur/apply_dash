import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Zap, Send } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { toast.error('Enter your email address'); return; }
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A0A0A' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: '100%', maxWidth: 440,
          background: '#111111', borderRadius: 20,
          border: '1px solid #2A2A2A', padding: '48px 40px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg, #FF6B00, #FF8C00)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 0 30px #FF6B0055' }}>
            <Zap size={28} color="#fff" />
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Reset password</h1>
          <p style={{ color: '#A0A0A0', fontSize: 15 }}>Enter your email and we'll send you a reset link</p>
        </div>

        {sent ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
            <h3 style={{ color: '#fff', fontFamily: 'Syne, sans-serif', marginBottom: 8 }}>Check your email</h3>
            <p style={{ color: '#A0A0A0', fontSize: 14, marginBottom: 24 }}>
              We've sent a reset link to <strong style={{ color: '#FF6B00' }}>{email}</strong>
            </p>
            <Link to="/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              color: '#FF6B00', textDecoration: 'none', fontWeight: 500,
            }}>
              <ArrowLeft size={16} /> Back to login
            </Link>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'block', color: '#A0A0A0', fontSize: 13, fontWeight: 500, marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
                <input
                  type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={{ width: '100%', padding: '12px 14px 12px 42px', background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 10, color: '#fff', fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#FF6B00'}
                  onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                />
              </div>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
              style={{ padding: '13px', borderRadius: 10, background: loading ? '#333' : 'linear-gradient(135deg, #FF6B00, #FF8C00)', color: '#fff', fontWeight: 600, fontSize: 15, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 0 24px #FF6B0033' }}>
              {loading ? 'Sending...' : <><Send size={16} /> Send Reset Link</>}
            </motion.button>
            <Link to="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#A0A0A0', textDecoration: 'none', fontSize: 14 }}>
              <ArrowLeft size={14} /> Back to login
            </Link>
          </form>
        )}
      </motion.div>
    </div>
  );
}
