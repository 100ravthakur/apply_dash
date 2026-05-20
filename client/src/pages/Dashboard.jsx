import { useState, useEffect } from 'react';
import Topbar from '../components/common/Topbar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [apps, setApps] = useState([]);
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    api.get('/applications/stats').then(r => setStats(r.data.stats)).catch(() => {});
    api.get('/applications?limit=6').then(r => setApps(r.data.applications || [])).catch(() => {});
    api.get('/analytics/overview').then(r => setOverview(r.data.overview)).catch(() => {});
  }, []);

  const s = stats || { total:0, today:0, dailyLimit:30, interviews:0, offers:0, shortlisted:0 };
  const todayPct = Math.round((s.today / s.dailyLimit) * 100);
  const weekly = overview?.weeklyData || [
    {day:'Sun',applied:0},{day:'Mon',applied:0},{day:'Tue',applied:0},
    {day:'Wed',applied:0},{day:'Thu',applied:0},{day:'Fri',applied:0},{day:'Sat',applied:0},
  ];

  const statusColor = { applied:'var(--info)', viewed:'var(--warn)', shortlisted:'var(--success)', interview:'var(--accent)', offered:'var(--success)', rejected:'var(--err)' };

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1, overflow:'hidden' }}>
      <Topbar title={`Good morning, ${user?.name?.split(' ')[0] || 'there'} 👋`} subtitle="Your job search overview" />
      <div style={{ flex:1, overflowY:'auto', padding:'18px 22px', display:'flex', flexDirection:'column', gap:14 }}>

        {/* Stats row */}
        <div className="grid-4">
          {[
            { label:'Total Applied', value:s.total, sub:`+${s.today} today`, icon:'📊' },
            { label:'Applied Today', value:<>{s.today}<span style={{fontSize:13,color:'var(--txt3)'}}>/{s.dailyLimit}</span></>, sub:<><div className="progress" style={{marginTop:5}}><div className="progress-fill" style={{width:`${todayPct}%`}} /></div><span style={{fontSize:10,color:'var(--warn)'}}>{s.dailyLimit-s.today} remaining</span></>, icon:'⚡' },
            { label:'Interviews', value:s.interviews, sub:'Scheduled', icon:'🎯' },
            { label:'Offers', value:s.offers, sub:'Received', icon:'🏆' },
          ].map((c,i) => (
            <div key={i} className="stat-card" style={{ borderTop: i===0?'2px solid var(--accent)':undefined }}>
              <div style={{ position:'absolute', top:12, right:12, width:28, height:28, borderRadius:7, background:'var(--accent-glow)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>{c.icon}</div>
              <div className="stat-label">{c.label}</div>
              <div className="stat-value">{c.value}</div>
              {c.sub && <div className="stat-sub">{c.sub}</div>}
            </div>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'3fr 2fr', gap:14 }}>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {/* Recent Applications */}
            <div className="card">
              <div className="section-title">📋 Recent Applications</div>
              {apps.length === 0 ? (
                <div style={{ textAlign:'center', padding:'30px 0' }}>
                  <div style={{ fontSize:32, marginBottom:10 }}>🚀</div>
                  <div style={{ fontSize:13, color:'var(--txt2)', marginBottom:12 }}>No applications yet. Start applying!</div>
                  <button className="btn btn-primary btn-sm" onClick={() => navigate('/jobs')}>Browse Job Queue →</button>
                </div>
              ) : apps.map((app, i) => (
                <div key={app._id||i} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0', borderBottom: i<apps.length-1?'1px solid var(--border)':undefined }}>
                  <div style={{ width:28, height:28, borderRadius:7, background:'rgba(255,107,0,0.1)', border:'1px solid rgba(255,107,0,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:12, color:'var(--accent)', flexShrink:0 }}>{(app.company||'?')[0]}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12, fontWeight:500, color:'var(--txt)' }}>{app.jobTitle}</div>
                    <div style={{ fontSize:11, color:'var(--txt3)' }}>{app.company} · {app.platform}</div>
                  </div>
                  <span className={`badge badge-${app.status}`}>{app.status}</span>
                  <div style={{ fontSize:13, fontWeight:700, color:'var(--accent)', fontFamily:'var(--font-display)', minWidth:34 }}>{app.matchScore||0}%</div>
                </div>
              ))}
            </div>

            {/* Weekly chart */}
            <div className="card">
              <div className="section-title">📈 This Week</div>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={weekly} margin={{top:0,right:0,bottom:0,left:-30}}>
                  <XAxis dataKey="day" tick={{fontSize:10,fill:'var(--txt3)'}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fontSize:10,fill:'var(--txt3)'}} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:8,fontSize:11}} cursor={{fill:'rgba(255,107,0,0.06)'}} />
                  <Bar dataKey="applied" fill="var(--accent)" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {/* Quick actions */}
            <div className="card">
              <div className="section-title">⚡ Quick Actions</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {[
                  { label:'Browse Job Queue', sub:'AI-matched jobs', icon:'💼', to:'/jobs' },
                  { label:'Connect Platforms', sub:'LinkedIn, Indeed, Naukri', icon:'🔗', to:'/platforms' },
                  { label:'Complete Profile', sub:'Better matches', icon:'👤', to:'/settings' },
                  { label:'Ask AI Assistant', sub:'Cover letters & prep', icon:'🤖', to:'/ai' },
                ].map((a,i) => (
                  <button key={i} onClick={() => navigate(a.to)} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:'var(--bg4)', border:'1px solid var(--border)', borderRadius:8, cursor:'pointer', textAlign:'left', transition:'all 0.15s' }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(255,107,0,0.3)';e.currentTarget.style.background='rgba(255,107,0,0.05)'}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg4)'}}>
                    <span style={{ fontSize:18 }}>{a.icon}</span>
                    <div>
                      <div style={{ fontSize:12, fontWeight:500, color:'var(--txt)' }}>{a.label}</div>
                      <div style={{ fontSize:11, color:'var(--txt3)' }}>{a.sub}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Insight */}
            <div className="card" style={{ background:'linear-gradient(135deg,rgba(255,107,0,0.08),rgba(255,107,0,0.02))', borderColor:'rgba(255,107,0,0.2)' }}>
              <div className="section-title" style={{ color:'var(--accent)' }}>💡 AI Insight</div>
              <div style={{ fontSize:12, color:'var(--txt2)', lineHeight:1.65 }}>Complete your profile and connect platforms to get personalized AI job matching and automated applications.</div>
              <button className="btn btn-primary btn-sm" style={{ marginTop:10, width:'100%' }} onClick={() => navigate('/ai')}>Chat with AI →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
