import { useState, useEffect } from 'react';
import Topbar from '../components/common/Topbar';
import api from '../services/api';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/overview').then(r => setData(r.data.overview)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const d = data || {};
  const weekly = d.weeklyData || [
    {day:'Mon',applied:28},{day:'Tue',applied:30},{day:'Wed',applied:25},
    {day:'Thu',applied:30},{day:'Fri',applied:29},{day:'Sat',applied:20},{day:'Sun',applied:23},
  ];
  const platform = d.platformBreakdown || [
    {platform:'LinkedIn',count:142,responseRate:3.8},
    {platform:'Indeed',count:78,responseRate:2.9},
    {platform:'Naukri',count:27,responseRate:1.4},
  ];
  const skills = d.skillsInDemand || [
    {skill:'System Design',demand:91},{skill:'Go / Golang',demand:87},{skill:'AWS / GCP',demand:82},
    {skill:'Kubernetes',demand:74},{skill:'PostgreSQL',demand:65},{skill:'React',demand:58},
  ];

  const COLORS = ['var(--accent)','var(--info)','var(--success)','var(--warn)'];

  if (loading) return <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center'}}><LoadingSpinner /></div>;

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1, overflow:'hidden' }}>
      <Topbar title="Analytics" subtitle="Last 30 days performance overview" />
      <div style={{ flex:1, overflowY:'auto', padding:'18px 22px', display:'flex', flexDirection:'column', gap:14 }}>
        {/* Stats row */}
        <div className="grid-4">
          {[
            {l:'Avg Match Score',v:`${d.avgMatchScore||84}%`,c:'var(--accent)',sub:'↑ +4pts this month'},
            {l:'Response Rate',v:`${d.responseRate||3.2}%`,c:'var(--success)',sub:'Market avg: 2.1%'},
            {l:'Best Platform',v:'LinkedIn',c:'var(--txt)',sub:'3.8% response rate'},
            {l:'Peak Apply Time',v:'9–11 AM',c:'var(--txt)',sub:'Most responses received'},
          ].map((s,i) => (
            <div key={i} className="stat-card" style={{ padding:'12px 14px' }}>
              <div className="stat-label">{s.l}</div>
              <div className="stat-value" style={{ fontSize:18, color:s.c }}>{s.v}</div>
              <div className="stat-sub up" style={{ fontSize:10 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid-2">
          {/* Weekly applications bar chart */}
          <div className="card">
            <div className="section-title">📅 Weekly Applications</div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={weekly} margin={{top:0,right:0,bottom:0,left:-30}}>
                <XAxis dataKey="day" tick={{fontSize:10,fill:'var(--txt3)'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize:10,fill:'var(--txt3)'}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:8,fontSize:11}} cursor={{fill:'rgba(255,107,0,0.06)'}} />
                <Bar dataKey="applied" fill="var(--accent)" radius={[3,3,0,0]} opacity={0.9} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Platform breakdown */}
          <div className="card">
            <div className="section-title">🏆 Platform Breakdown</div>
            {platform.map((p,i) => (
              <div key={i} style={{ marginBottom:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                  <span style={{ fontSize:12, color:'var(--txt2)' }}>{p.platform}</span>
                  <span style={{ fontSize:12, fontWeight:600, fontFamily:'var(--font-mono)', color:'var(--txt)' }}>{p.count} <span style={{color:'var(--success)',fontWeight:400}}>({p.responseRate}%)</span></span>
                </div>
                <div className="progress">
                  <div className="progress-fill" style={{ width:`${(p.count/200)*100}%`, background: i===0?'var(--accent)':i===1?'var(--info)':'var(--success)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills in demand */}
        <div className="card">
          <div className="section-title">💡 Skills in Demand (from companies that viewed your profile)</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px 24px' }}>
            {skills.map((s,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ fontSize:12, color:'var(--txt2)', fontFamily:'var(--font-mono)', minWidth:140 }}>{s.skill}</div>
                <div style={{ flex:1 }}>
                  <div className="progress" style={{ height:5 }}>
                    <div className="progress-fill" style={{ width:`${s.demand}%`, background:`hsl(${(1-s.demand/100)*240},70%,60%)` }} />
                  </div>
                </div>
                <div style={{ fontSize:12, fontWeight:600, color:'var(--accent)', minWidth:32, textAlign:'right' }}>{s.demand}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Response rate by role */}
        <div className="card">
          <div className="section-title">📊 Response Rate by Role</div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {[
              {role:'Backend Engineer',rate:4.2,apps:89},{role:'Sr. Software Engineer',rate:3.8,apps:72},
              {role:'Platform Engineer',rate:2.9,apps:41},{role:'SDE-2 / SDE-3',rate:2.4,apps:38},
            ].map((r,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'8px 0', borderBottom: i<3?'1px solid var(--border)':undefined }}>
                <div style={{ fontSize:13, fontWeight:700, fontFamily:'var(--font-display)', color:'var(--txt3)', width:16, textAlign:'center' }}>{i+1}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, color:'var(--txt)' }}>{r.role}</div>
                  <div style={{ fontSize:11, color:'var(--txt3)' }}>{r.apps} applications</div>
                </div>
                <div style={{ fontSize:14, fontWeight:700, color:'var(--success)', fontFamily:'var(--font-mono)' }}>{r.rate}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
