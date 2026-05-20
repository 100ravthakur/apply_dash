import { useState, useEffect } from 'react';
import Topbar from '../components/common/Topbar';
import api from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';

const CompanyBubble = ({ letter, size = 36 }) => {
  const colors = { G:'#4285F4',M:'#00A4EF',S:'#635BFF',R:'#2EB2FF',F:'#F0950E',A:'#FF9900',C:'#1A237E',Z:'#E23744',P:'#5F259F',D:'#00C7B7' };
  const c = colors[letter] || '#555';
  return <div style={{ width:size,height:size,borderRadius:Math.round(size*0.22),background:`${c}20`,border:`1px solid ${c}44`,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:Math.round(size*0.38),flexShrink:0,color:c }}>{letter}</div>;
};

const FALLBACK_JOBS = [
  { _id:'1', logo:'G', company:'Google', title:'Senior Software Engineer', location:'Bangalore', locationType:'hybrid', salary:'₹60–85L', platform:'linkedin', skills:['Go','Kubernetes','AWS'], matchScore:94, matchReason:'Strong match: Go, Distributed Systems, 5YOE aligns perfectly', postedAt: new Date() },
  { _id:'2', logo:'S', company:'Stripe', title:'Backend Engineer', location:'Remote', locationType:'remote', salary:'₹55–75L', platform:'linkedin', skills:['Go','Python','AWS'], matchScore:96, matchReason:'Top pick: Payment systems + Go is a direct match for their stack', postedAt: new Date() },
  { _id:'3', logo:'M', company:'Microsoft', title:'SWE II — Azure Platform', location:'Hyderabad', locationType:'hybrid', salary:'₹45–65L', platform:'indeed', skills:['C#','Azure','Docker'], matchScore:89, matchReason:'Azure background + distributed systems is exactly what they need', postedAt: new Date() },
  { _id:'4', logo:'R', company:'Razorpay', title:'Sr. SWE, Payments', location:'Bangalore', locationType:'onsite', salary:'₹40–55L', platform:'naukri', skills:['Java','Go','Kafka'], matchScore:87, matchReason:'Fintech domain + Go experience aligns with their infrastructure', postedAt: new Date() },
  { _id:'5', logo:'F', company:'Flipkart', title:'SDE-3, Platform Engineering', location:'Bangalore', locationType:'hybrid', salary:'₹45–60L', platform:'linkedin', skills:['Java','Scala','Kafka'], matchScore:85, matchReason:'Large-scale systems experience is a strong culture + tech fit', postedAt: new Date() },
  { _id:'6', logo:'C', company:'CRED', title:'Senior Engineer — Core', location:'Bangalore', locationType:'onsite', salary:'₹40–55L', platform:'indeed', skills:['Go','PostgreSQL','Redis'], matchScore:91, matchReason:'Product-focused role, strong culture match based on your profile', postedAt: new Date() },
];

export default function JobQueue() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [applying, setApplying] = useState({});

  useEffect(() => {
    api.get('/jobs/queue').then(r => setJobs(r.data.jobs?.length ? r.data.jobs : FALLBACK_JOBS)).catch(() => setJobs(FALLBACK_JOBS)).finally(() => setLoading(false));
  }, []);

  const applyNow = async (job) => {
    setApplying(a => ({...a, [job._id]: true}));
    try {
      await api.post('/applications', {
        jobTitle: job.title, company: job.company, platform: job.platform,
        location: job.location, salary: job.salary, status: 'applied', matchScore: job.matchScore || 75,
      });
      toast.success(`Applied to ${job.title} at ${job.company}!`);
      setJobs(js => js.filter(j => j._id !== job._id));
    } catch (e) {
      toast.error(e.response?.data?.message || 'Apply failed');
    } finally {
      setApplying(a => ({...a, [job._id]: false}));
    }
  };

  const tabs = ['all', 'linkedin', 'indeed', 'naukri'];

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1, overflow:'hidden' }}>
      <Topbar title="Job Queue" subtitle={`${jobs.length} jobs matched today · Sorted by AI score`} />
      <div style={{ flex:1, overflowY:'auto', padding:'18px 22px', display:'flex', flexDirection:'column', gap:12 }}>
        <div style={{ display:'flex', gap:6, alignItems:'center', flexWrap:'wrap' }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setActiveTab(t)} className="btn btn-sm" style={{ border:`1px solid ${activeTab===t ? 'rgba(255,107,0,0.35)' : 'var(--border)'}`, color: activeTab===t ? 'var(--accent)' : 'var(--txt2)', background: activeTab===t ? 'var(--accent-glow)' : 'transparent' }}>
              {t === 'all' ? `All (${jobs.length})` : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
          <div style={{ marginLeft:'auto', fontSize:11, color:'var(--txt3)', fontFamily:'var(--font-mono)' }}>Daily limit: 30 applications</div>
        </div>

        {loading ? <LoadingSpinner text="Fetching AI-matched jobs..." /> : (jobs.filter(j => activeTab==='all' || j.platform===activeTab).map((job,idx) => (
          <div key={job._id} className="card fade-in" style={{ transition:'all 0.2s', cursor:'pointer', animationDelay:`${idx*0.04}s` }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(255,107,0,0.3)'; e.currentTarget.style.background='var(--bg4)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--bg3)'; }}>
            <div style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:10 }}>
              <CompanyBubble letter={(job.company||'?')[0]} size={36} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:600, color:'var(--txt)', marginBottom:2 }}>{job.title}</div>
                <div style={{ fontSize:11, color:'var(--txt2)' }}>{job.company} · <span style={{ color:'var(--success)', fontFamily:'var(--font-mono)' }}>{job.salary}</span></div>
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <div style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:800, color:'var(--accent)' }}>{job.matchScore||75}%</div>
                <div style={{ fontSize:10, color:'var(--txt3)' }}>match</div>
              </div>
            </div>

            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:10, flexWrap:'wrap' }}>
              <span className="tag tag-default">📍 {job.location}</span>
              <span className={`tag tag-${job.locationType||'onsite'}`}>{job.locationType||'onsite'}</span>
              <span className="tag tag-default">{job.platform}</span>
              <span style={{ marginLeft:'auto', fontSize:10, color:'var(--txt3)', fontFamily:'var(--font-mono)' }}>{job.postedAt ? new Date(job.postedAt).toLocaleDateString() : 'Today'}</span>
            </div>

            {job.matchReason && (
              <div style={{ fontSize:11, color:'var(--txt3)', fontStyle:'italic', padding:'7px 10px', background:'rgba(255,107,0,0.04)', borderLeft:'2px solid rgba(255,107,0,0.3)', borderRadius:'0 6px 6px 0', marginBottom:10 }}>
                🤖 {job.matchReason}
              </div>
            )}

            {job.skills?.length > 0 && (
              <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginBottom:10 }}>
                {job.skills.slice(0,5).map(s => (
                  <span key={s} style={{ padding:'2px 7px', background:'rgba(255,255,255,0.04)', border:'1px solid var(--border)', borderRadius:4, fontSize:10, fontFamily:'var(--font-mono)', color:'var(--txt2)' }}>{s}</span>
                ))}
              </div>
            )}

            <div style={{ display:'flex', gap:6 }}>
              <button className="btn btn-primary btn-sm" onClick={() => applyNow(job)} disabled={applying[job._id]}>
                {applying[job._id] ? '⏳ Applying...' : '⚡ Apply Now'}
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => toast.info('Job saved!')}>💾 Save</button>
              <button className="btn btn-ghost btn-sm" style={{ marginLeft:'auto', color:'var(--err)' }} onClick={() => setJobs(js => js.filter(j => j._id !== job._id))}>✕ Skip</button>
            </div>
          </div>
        )))}
      </div>
    </div>
  );
}
