import { useState } from 'react';
import Topbar from '../components/common/Topbar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user } = useAuth();
  const [pwd, setPwd] = useState({ currentPassword:'', newPassword:'', confirm:'' });
  const [saving, setSaving] = useState(false);
  const [dailyLimit, setDailyLimit] = useState(30);

  const changePwd = async (e) => {
    e.preventDefault();
    if (pwd.newPassword !== pwd.confirm) return toast.error('Passwords do not match');
    if (pwd.newPassword.length < 6) return toast.error('Password must be 6+ chars');
    setSaving(true);
    try {
      await api.put('/auth/change-password', { currentPassword: pwd.currentPassword, newPassword: pwd.newPassword });
      toast.success('Password changed!');
      setPwd({ currentPassword:'', newPassword:'', confirm:'' });
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
    setSaving(false);
  };

  const savePrefs = async () => {
    try {
      await api.put('/profile/preferences', { dailyApplyCount: dailyLimit });
      toast.success('Preferences saved!');
    } catch { toast.error('Error saving'); }
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1, overflow:'hidden' }}>
      <Topbar title="Settings" subtitle="Account & automation preferences" />
      <div style={{ flex:1, overflowY:'auto', padding:'18px 22px', display:'flex', flexDirection:'column', gap:14 }}>

        {/* Account info */}
        <div className="card">
          <div className="section-title">👤 Account</div>
          <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0' }}>
            <div style={{ width:44, height:44, borderRadius:'50%', background:'linear-gradient(135deg,var(--accent),#FF4444)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:700, color:'#fff' }}>
              {user?.name?.slice(0,2).toUpperCase()||'U'}
            </div>
            <div>
              <div style={{ fontSize:14, fontWeight:600 }}>{user?.name}</div>
              <div style={{ fontSize:12, color:'var(--txt3)' }}>{user?.email}</div>
              <span className="badge badge-pro" style={{ marginTop:4 }}>{user?.subscription?.toUpperCase()||'FREE'}</span>
            </div>
          </div>
        </div>

        {/* Automation prefs */}
        <div className="card">
          <div className="section-title">⚡ Automation Preferences</div>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div>
              <label className="input-label">Daily Application Limit: <strong style={{color:'var(--accent)'}}>{dailyLimit}</strong></label>
              <input type="range" min={1} max={30} value={dailyLimit} onChange={e=>setDailyLimit(+e.target.value)} style={{ width:'100%', accentColor:'var(--accent)', marginTop:6 }} />
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'var(--txt3)' }}><span>1</span><span>30 (max)</span></div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={savePrefs}>Save Preferences</button>
          </div>
        </div>

        {/* Change password */}
        <div className="card">
          <div className="section-title">🔑 Change Password</div>
          <form onSubmit={changePwd} style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {[['currentPassword','Current Password'],['newPassword','New Password'],['confirm','Confirm New Password']].map(([k,l]) => (
              <div key={k}>
                <label className="input-label">{l}</label>
                <input className="input" type="password" placeholder="••••••••" value={pwd[k]} onChange={e=>setPwd(p=>({...p,[k]:e.target.value}))} required />
              </div>
            ))}
            <button type="submit" className="btn btn-primary btn-sm" style={{ alignSelf:'flex-start', marginTop:4 }} disabled={saving}>{saving?'Saving...':'Change Password'}</button>
          </form>
        </div>

        {/* About */}
        <div className="card" style={{ fontSize:12, color:'var(--txt3)' }}>
          <div className="section-title">ℹ️ About</div>
          AutoApply Pro v1.0.0 · Built with React + Node.js + Claude AI<br/>
          <span style={{ color:'var(--accent)', cursor:'pointer' }} onClick={() => toast.info('Thanks for using AutoApply Pro! 🚀')}>⭐ Rate this app</span>
        </div>
      </div>
    </div>
  );
}
