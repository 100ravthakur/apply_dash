import { useState } from 'react';
import Topbar from '../components/common/Topbar';
import toast from 'react-hot-toast';

const COMPANIES = [
  {n:'Google',ind:'Technology / Cloud',size:'100K+',rating:4.4,loc:'Bangalore',open:12,logo:'G',tech:['Go','Python','Kubernetes','BigQuery']},
  {n:'Stripe',ind:'Fintech / Payments',size:'5K+',rating:4.6,loc:'Remote',open:5,logo:'S',tech:['Go','Ruby','React','AWS']},
  {n:'Microsoft',ind:'Enterprise Technology',size:'200K+',rating:4.3,loc:'Hyderabad',open:28,logo:'M',tech:['C#','TypeScript','Azure','Go']},
  {n:'Razorpay',ind:'Fintech',size:'3K+',rating:4.2,loc:'Bangalore',open:7,logo:'R',tech:['Go','Java','Kafka','MySQL']},
  {n:'CRED',ind:'Fintech / Consumer',size:'1K+',rating:4.1,loc:'Bangalore',open:9,logo:'C',tech:['Go','PostgreSQL','Redis','Kubernetes']},
  {n:'Swiggy',ind:'Foodtech / Logistics',size:'5K+',rating:3.9,loc:'Bangalore',open:15,logo:'S',tech:['Go','Python','Kafka','MySQL']},
  {n:'Flipkart',ind:'E-commerce',size:'30K+',rating:3.8,loc:'Bangalore',open:22,logo:'F',tech:['Java','Scala','Spark','Flink']},
  {n:'PhonePe',ind:'Fintech',size:'4K+',rating:4.0,loc:'Bangalore',open:11,logo:'P',tech:['Go','Java','Kotlin','MySQL']},
  {n:'Freshworks',ind:'SaaS / CRM',size:'7K+',rating:4.2,loc:'Chennai',open:18,logo:'F',tech:['Ruby','Go','React','PostgreSQL']},
  {n:'Databricks',ind:'Data / AI',size:'5K+',rating:4.5,loc:'Remote',open:8,logo:'D',tech:['Scala','Python','Spark','Kubernetes']},
  {n:'Atlassian',ind:'Developer Tools',size:'10K+',rating:4.3,loc:'Remote',open:6,logo:'A',tech:['Java','Go','React','AWS']},
  {n:'Salesforce',ind:'CRM / SaaS',size:'70K+',rating:4.3,loc:'Hyderabad',open:31,logo:'S',tech:['Java','Go','LWC','Heroku']},
];

const companyColors = {G:'#4285F4',M:'#00A4EF',S:'#635BFF',R:'#2EB2FF',F:'#F0950E',A:'#FF9900',C:'#1A237E',Z:'#E23744',P:'#5F259F',D:'#FF6600'};

export default function Companies() {
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('all');

  const filtered = COMPANIES.filter(c => {
    const matchSearch = !search || c.n.toLowerCase().includes(search.toLowerCase()) || c.ind.toLowerCase().includes(search.toLowerCase());
    const matchInd = industry === 'all' || c.ind.toLowerCase().includes(industry.toLowerCase());
    return matchSearch && matchInd;
  });

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1, overflow:'hidden' }}>
      <Topbar title="Companies" subtitle={`${COMPANIES.length} companies · Research & track opportunities`} />
      <div style={{ flex:1, overflowY:'auto', padding:'18px 22px', display:'flex', flexDirection:'column', gap:14 }}>
        <div style={{ display:'flex', gap:8 }}>
          <input className="input" style={{ flex:1 }} placeholder="Search companies, industries..." value={search} onChange={e=>setSearch(e.target.value)} />
          <select className="input" style={{ width:160 }} value={industry} onChange={e=>setIndustry(e.target.value)}>
            {['all','Technology','Fintech','SaaS','E-commerce','Foodtech','Data'].map(i=><option key={i} value={i.toLowerCase()}>{i==='all'?'All Industries':i}</option>)}
          </select>
        </div>

        <div className="grid-2">
          {filtered.map((c,i) => {
            const color = companyColors[c.logo] || '#666';
            return (
              <div key={i} className="card" style={{ cursor:'pointer', transition:'all 0.2s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(255,107,0,0.3)';e.currentTarget.style.transform='translateY(-1px)'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.transform='none'}}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                  <div style={{ width:40, height:40, borderRadius:10, background:`${color}20`, border:`1px solid ${color}44`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:16, flexShrink:0, color }}>{c.logo}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'var(--txt)' }}>{c.n}</div>
                    <div style={{ fontSize:11, color:'var(--txt3)' }}>{c.ind} · {c.size} employees</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'var(--warn)' }}>★ {c.rating}</div>
                    <div style={{ fontSize:10, color:'var(--txt3)' }}>Glassdoor</div>
                  </div>
                </div>

                <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginBottom:10 }}>
                  {c.tech.map(t=><span key={t} style={{ padding:'1px 6px', background:'rgba(255,255,255,0.04)', border:'1px solid var(--border)', borderRadius:3, fontSize:10, fontFamily:'var(--font-mono)', color:'var(--txt3)' }}>{t}</span>)}
                </div>

                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span className="tag tag-default">📍 {c.loc}</span>
                  <span style={{ fontSize:11, color:'var(--success)', fontFamily:'var(--font-mono)' }}>{c.open} open roles</span>
                  <button className="btn btn-ghost btn-sm" style={{ marginLeft:'auto' }} onClick={() => toast.info(`AI is researching ${c.n} — culture, interview process, salaries. Try the AI Assistant!`)}>Research →</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
