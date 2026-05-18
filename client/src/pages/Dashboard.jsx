import { useState, useEffect } from 'react';
import Topbar from '../components/common/Topbar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const mockFeed = [
  { logo:'G', company:'Google', role:'Senior SWE, Backend', time:'2m ago', status:'tailoring' },
  { logo:'M', company:'Microsoft', role:'Software Engineer II', time:'8m ago', status:'applied' },
  { logo:'A', company:'Amazon', role:'SDE-2, Platform', time:'15m ago', status:'applied' },
  { logo:'F', company:'Flipkart', role:'Senior Engineer', time:'24m ago', status:'applied' },
  { logo:'S', company:'Swiggy', role:'Backend Engineer', time:'31m ago', status:'applied' },
  { logo:'R', company:'Razorpay', role:'Sr. Software Engineer', time:'45m ago', status:'applied' },
];

const weekData = [
  {day:'Mon',applied:28},{day:'Tue',applied:30},{day:'Wed',applied:25},
  {day:'Thu',applied:30},{day:'Fri',applied:29},{day:'Sat',applied:20},{day:'Sun',applied:23},
];

const CompanyBubble = ({ letter, size = 28 }) => {
  const colors = { G:'#4285F4',M:'#00A4EF',S:'#635BFF',R:'#2EB2FF',F:'#F0950E',A:'#FF9900',C:'#1A237E',Z:'#E23744',P:'#5F259F' };
  const c = colors[letter] || '#555';
  return <div style={{ width:size,height:size,borderRadius:Math.round(size*0.22),background:`${c}22`,border:`1px solid ${c}44`,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:Math.round(size*0.38),flexShrink:0,color:c }}>{letter}</div>;
};

const StatusBadge = ({ status }) => <span className={`badge badge-${status}`}>{status}</span>;

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    api.get('/applications/stats').then(r => setStats(r.data.stats)).catch(() => {});
    api.get('/analytics/overview').then(r => setOverview(r.data.overview)).catch(() => {});
  }, []);

  const s = stats || { total:247, today:23, dailyLimit:30, interviews:8, offers:2, shortlisted:18 };
  const todayPct = Math.round((s.today / s.dailyLimit) * 100);

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1, overflow:'hidden' }}>
      <Topbar title={`Good morning, ${user?.name?.split(' ')[0] || 'there'} 👋`} subtitle="Here's your job search overview" />
      <div style={{ flex:1, overflowY:'auto', padding:'18px 22px', display:'flex', flexDirection:'column', gap:14 }}>

        {/* Stats row */}
        <div className="grid-4">
          {[
            { label:'Total Applied', value:s.total, sub:`+${s.today} today`, subClass:'up', icon:'📊' },
            { label:'Applied Today', value:<>{s.today}<span style={{fontSize:13,color:'var(--txt3)'}}>/{s.dailyLimit}</span></>, sub:<><div className="progress" style={{marginTop:5}}><div className="progress-fill" style={{width:`${todayPct}%`}} /></div><span style={{fontSize:10,color:'var(--warn)'}}>{s.dailyLimit-s.today} remaining</span></>, icon:'⚡' },
            { label:'Interviews', value:s.interviews, sub:'3.2% success rate', subClass:'up', icon:'🎯' },
            { label:'Profile Views', value:41, sub:'↑ +12 this week', subClass:'up', icon:'👁' },
          ].map((c,i) => (
            <div key={i} className="stat-card" style={{ borderTop: i===0 ? '2px solid var(--accent)' : 'none' }}>
              <div style={{ position:'absolute', top:12, right:12, width:28, height:28, borderRadius:7, background:'var(--accent-glow)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>{c.icon}</div>
              <div className="stat-label">{c.label}</div>
              <div className="stat-value">{c.value}</div>
              {c.sub && <div className={`stat-sub ${c.subClass||''}`}>{c.sub}</div>}
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div style={{ display:'grid', gridTemplateColumns:'3fr 2fr', gap:14 }}>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {/* Application Feed */}
            <div className="card">
              <div className="section-title">
                <span style={{ width:7, height:7, borderRadius:'50%', background:'var(--success)', display:'inline-block', animation:'pulse 1.5s infinite' }} />
                Today's Application Feed
              </div>
              {mockFeed.map((f,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0', borderBottom: i<mockFeed.length-1 ? '1px solid var(--border)' : 'none' }}>
                  <CompanyBubble letter={f.logo} size={28} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12, fontWeight:500, color:'var(--txt)', marginBottom:1 }}>{f.role}</div>
                    <div style={{ fontSize:11, color:'var(--txt3)' }}>{f.company}</div>
                  </div>
                  <StatusBadge status={f.status} />
                  <div style={{ fontSize:10, color:'var(--txt3)', fontFamily:'var(--font-mono)' }}>{f.time}</div>
                </div>
              ))}
            </div>

            {/* Weekly chart */}
            <div className="card">
              <div className="section-title">📈 This Week</div>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={weekData} margin={{ top:0, right:0, bottom:0, left:-30 }}>
                  <XAxis dataKey="day" tick={{ fontSize:10, fill:'var(--txt3)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize:10, fill:'var(--txt3)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, fontSize:11 }} cursor={{ fill:'rgba(255,107,0,0.06)' }} />
                  <Bar dataKey="applied" fill="var(--accent)" radius={[3,3,0,0]} opacity={0.8} />
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display:'flex', gap:16, marginTop:8 }}>
                <div style={{ fontSize:11, color:'var(--txt3)' }}>Avg/day: <span style={{color:'var(--txt)',fontWeight:600}}>26.7</span></div>
                <div style={{ fontSize:11, color:'var(--txt3)' }}>Response: <span style={{color:'var(--success)',fontWeight:600}}>3.2%</span></div>
              </div>
            </div>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {/* Automation status */}
            <div className="card">
              <div className="section-title">🤖 Automation Status</div>
              {[
                { label:'in', name:'LinkedIn', status:'active', count:11, cls:'plat-linkedin' },
                { label:'I', name:'Indeed', status:'active', count:8, cls:'plat-indeed' },
                { label:'N', name:'Naukri', status:'warn', count:4, cls:'plat-naukri', warn:true },
                { label:'G', name:'Glassdoor', status:'active', count:4, cls:'plat-glassdoor' },
              ].map((p,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 10px', borderRadius:8, marginBottom:6, background: p.warn ? 'rgba(255,184,0,0.05)' : 'rgba(0,200,150,0.04)', border:`1px solid ${p.warn ? 'rgba(255,184,0,0.2)' : 'rgba(0,200,150,0.15)'}` }}>
                  <div className={p.cls} style={{ width:28, height:28, borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:11, flexShrink:0 }}>{p.label}</div>
                  <div style={{ flex:1, fontSize:12, color:'var(--txt)' }}>{p.name}</div>
                  <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:10, fontFamily:'var(--font-mono)', color: p.warn ? 'var(--warn)' : 'var(--success)' }}>
                    <span style={{ width:5, height:5, borderRadius:'50%', background: p.warn ? 'var(--warn)' : 'var(--success)', display:'inline-block' }} />
                    {p.warn ? 'CAPTCHA' : `${p.count} sent`}
                  </div>
                </div>
              ))}
            </div>

            {/* Top Matches */}
            <div className="card">
              <div className="section-title">🎯 Top Matches Today</div>
              {[
                { logo:'S', company:'Stripe', role:'Backend Engineer', score:96, sal:'₹55–75L' },
                { logo:'C', company:'CRED', role:'Sr. SWE', score:91, sal:'₹40–55L' },
                { logo:'R', company:'Razorpay', role:'Platform Eng', score:87, sal:'₹35–50L' },
              ].map((j,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 0', borderBottom: i<2 ? '1px solid var(--border)' : 'none' }}>
                  <CompanyBubble letter={j.logo} size={28} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12, fontWeight:500, color:'var(--txt)' }}>{j.role}</div>
                    <div style={{ fontSize:10, color:'var(--success)', fontFamily:'var(--font-mono)' }}>{j.company} · {j.sal}</div>
                  </div>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:800, color:'var(--accent)' }}>{j.score}%</div>
                </div>
              ))}
            </div>

            {/* AI Insight */}
            <div className="card" style={{ background:'linear-gradient(135deg, rgba(255,107,0,0.08), rgba(255,107,0,0.02))', borderColor:'rgba(255,107,0,0.2)' }}>
              <div className="section-title" style={{ color:'var(--accent)' }}>💡 AI Insight</div>
              <div style={{ fontSize:12, color:'var(--txt2)', lineHeight:1.65 }}>Your <strong style={{color:'var(--txt)'}}>Go + Kubernetes</strong> skills are trending this week. 12 of today's top companies specifically listed these. Consider adding your K8s project to your headline.</div>
              <button className="btn btn-primary btn-sm" style={{ marginTop:10, width:'100%' }} onClick={() => window.location.href='/ai'}>Ask AI for tips →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
