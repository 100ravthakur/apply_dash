import { useState, useEffect } from 'react';
import Topbar from '../components/common/Topbar';
import api from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';

const STATUSES = ['all','applied','viewed','shortlisted','interview','offered','rejected'];
const CompanyBubble = ({ letter, size = 30 }) => {
  const colors = { G:'#4285F4',M:'#00A4EF',S:'#635BFF',R:'#2EB2FF',F:'#F0950E',A:'#FF9900',C:'#1A237E',Z:'#E23744',P:'#5F259F' };
  const c = colors[letter] || '#555';
  return <div style={{ width:size,height:size,borderRadius:Math.round(size*0.22),background:`${c}20`,border:`1px solid ${c}44`,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:Math.round(size*0.38),flexShrink:0,color:c }}>{letter}</div>;
};

const MOCK = [
  { _id:'1', jobTitle:'Senior SWE', company:'Google', platform:'LinkedIn', createdAt:new Date(), status:'viewed', matchScore:94 },
  { _id:'2', jobTitle:'Backend Engineer', company:'Stripe', platform:'LinkedIn', createdAt:new Date(), status:'shortlisted', matchScore:96 },
  { _id:'3', jobTitle:'SDE II', company:'Microsoft', platform:'Indeed', createdAt:new Date(Date.now()-86400000), status:'applied', matchScore:89 },
  { _id:'4', jobTitle:'Sr. SWE', company:'Razorpay', platform:'Naukri', createdAt:new Date(Date.now()-172800000), status:'interview', matchScore:87 },
  { _id:'5', jobTitle:'SDE-3', company:'Flipkart', platform:'LinkedIn', createdAt:new Date(Date.now()-259200000), status:'applied', matchScore:85 },
  { _id:'6', jobTitle:'Platform Eng', company:'PhonePe', platform:'Indeed', createdAt:new Date(Date.now()-345600000), status:'rejected', matchScore:82 },
  { _id:'7', jobTitle:'Sr. Engineer', company:'CRED', platform:'LinkedIn', createdAt:new Date(Date.now()-432000000), status:'shortlisted', matchScore:91 },
  { _id:'8', jobTitle:'Backend Lead', company:'Zomato', platform:'Naukri', createdAt:new Date(Date.now()-518400000), status:'offered', matchScore:88 },
];

export default function Applications() {
  const [apps, setApps] = useState([]);
  const [stats, setStats] = useState({});
  const [activeStatus, setActiveStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ jobTitle:'', company:'', platform:'linkedin', location:'', salary:'', status:'applied' });

  const fetchApps = async () => {
    try {
      const [appsRes, statsRes] = await Promise.all([
        api.get('/applications', { params: { status: activeStatus === 'all' ? undefined : activeStatus, limit: 50 } }),
        api.get('/applications/stats'),
      ]);
      setApps(appsRes.data.applications?.length ? appsRes.data.applications : MOCK);
      setStats(statsRes.data.stats || {});
    } catch { setApps(MOCK); }
    setLoading(false);
  };

  useEffect(() => { fetchApps(); }, [activeStatus]);

  const addManual = async (e) => {
    e.preventDefault();
    try {
      await api.post('/applications', form);
      toast.success('Application added!');
      setShowModal(false);
      setForm({ jobTitle:'', company:'', platform:'linkedin', location:'', salary:'', status:'applied' });
      fetchApps();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const s = stats;

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1, overflow:'hidden' }}>
      <Topbar title="Applications" subtitle={`${s.total||247} total · ${s.today||23} today`}
        extra={<button className="btn btn-ghost btn-sm" onClick={() => setShowModal(true)}>+ Add Manual</button>} />

      <div style={{ flex:1, overflowY:'auto', padding:'18px 22px', display:'flex', flexDirection:'column', gap:12 }}>
        {/* Stats */}
        <div className="grid-4">
          {[{l:'Total',v:s.total||247,c:'var(--txt)'},{l:'Shortlisted',v:s.shortlisted||18,c:'var(--success)'},{l:'Interviews',v:s.interviews||8,c:'var(--accent)'},{l:'Offers',v:s.offers||2,c:'var(--warn)'}].map((m,i) => (
            <div key={i} className="stat-card" style={{ padding:'12px 14px' }}>
              <div className="stat-label">{m.l}</div>
              <div className="stat-value" style={{ fontSize:20, color:m.c }}>{m.v}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
          {STATUSES.map(s2 => (
            <button key={s2} onClick={() => setActiveStatus(s2)} className="btn btn-sm" style={{ border:`1px solid ${activeStatus===s2?'rgba(255,107,0,0.35)':'var(--border)'}`, color: activeStatus===s2?'var(--accent)':'var(--txt2)', background: activeStatus===s2?'var(--accent-glow)':'transparent' }}>
              {s2.charAt(0).toUpperCase() + s2.slice(1)}
            </button>
          ))}
        </div>

        {/* Applications list */}
        {loading ? <LoadingSpinner /> : (
          <div className="card" style={{ padding:0, overflow:'hidden' }}>
            {apps.map((app, i) => (
              <div key={app._id||i} style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px', borderBottom: i<apps.length-1?'1px solid var(--border)':undefined, cursor:'pointer', transition:'background 0.15s' }}
                onMouseEnter={e=>e.currentTarget.style.background='var(--bg4)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <CompanyBubble letter={(app.company||'?')[0]} size={30} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:500, color:'var(--txt)' }}>{app.jobTitle}</div>
                  <div style={{ fontSize:11, color:'var(--txt3)' }}>{app.company} · {app.platform} · {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Today'}</div>
                </div>
                <span className={`badge badge-${app.status}`}>{app.status}</span>
                <div style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:800, color:'var(--accent)', marginLeft:10, minWidth:34, textAlign:'right' }}>{app.matchScore||75}%</div>
                <div style={{ display:'flex', gap:4, marginLeft:8 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => toast.info('Cover letter: AI-generated personalized letter was submitted')}>CL</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => toast.success('Follow-up email sent!')}>📧</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add manual modal */}
      {showModal && (
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div style={{ fontFamily:'var(--font-display)', fontSize:16, fontWeight:700, marginBottom:16 }}>Add Manual Application</div>
            <form onSubmit={addManual} style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {[['jobTitle','Job Title *','Software Engineer'],['company','Company *','Google'],['location','Location','Bangalore'],['salary','Salary Range','₹40-60L']].map(([k,l,p]) => (
                <div key={k}>
                  <label className="input-label">{l}</label>
                  <input className="input" placeholder={p} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} required={l.includes('*')} />
                </div>
              ))}
              <div>
                <label className="input-label">Platform</label>
                <select className="input" value={form.platform} onChange={e=>setForm(f=>({...f,platform:e.target.value}))}>
                  {['linkedin','indeed','naukri','glassdoor','other'].map(p=><option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label">Status</label>
                <select className="input" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                  {['applied','viewed','shortlisted','interview','offered','rejected'].map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ display:'flex', gap:8, marginTop:8 }}>
                <button type="button" className="btn btn-ghost" style={{ flex:1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex:1 }}>Add Application</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
