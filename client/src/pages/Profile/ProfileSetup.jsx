import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const STEPS = ['Basic Info','Skills','Experience','Preferences','Resume','Done'];

export default function ProfileSetup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({
    headline:'', summary:'', currentRole:'', currentCompany:'', yearsOfExperience:0,
    technical:[], soft:[], tools:[],
    targetRoles:[], preferredLocations:[], jobType:[], salaryMin:'', salaryMax:'',
    linkedin:'', github:'', portfolio:'',
  });
  const [skillInput, setSkillInput] = useState('');
  const [catInput, setCatInput] = useState('technical');

  const set = (k) => (e) => setData(d => ({ ...d, [k]: e.target.value }));

  const addSkill = () => {
    if (!skillInput.trim()) return;
    setData(d => ({ ...d, [catInput]: [...(d[catInput]||[]).filter(s=>s!==skillInput.trim()), skillInput.trim()] }));
    setSkillInput('');
  };

  const removeSkill = (cat, s) => setData(d => ({ ...d, [cat]: d[cat].filter(x=>x!==s) }));

  const save = async () => {
    setSaving(true);
    try {
      await api.put('/profile', {
        headline: data.headline, summary: data.summary, currentRole: data.currentRole,
        currentCompany: data.currentCompany, yearsOfExperience: Number(data.yearsOfExperience),
        skills: { technical: data.technical, soft: data.soft, tools: data.tools, languages: [] },
        socialLinks: { linkedin: data.linkedin, github: data.github, portfolio: data.portfolio },
        preferences: {
          targetRoles: data.targetRoles, preferredLocations: data.preferredLocations,
          salaryMin: Number(data.salaryMin)||undefined, salaryMax: Number(data.salaryMax)||undefined,
        },
      });
      setStep(5);
    } catch (e) { toast.error(e.response?.data?.message || 'Save failed'); }
    setSaving(false);
  };

  const SkillTag = ({ cat, s }) => (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 8px', background:'rgba(255,107,0,0.1)', border:'1px solid rgba(255,107,0,0.25)', borderRadius:5, fontSize:11, color:'var(--accent)', fontFamily:'var(--font-mono)', margin:'2px' }}>
      {s} <button style={{ border:'none', background:'none', color:'var(--accent)', cursor:'pointer', padding:0, fontSize:12, lineHeight:1 }} onClick={() => removeSkill(cat, s)}>×</button>
    </span>
  );

  const renderStep = () => {
    switch(step) {
      case 0: return (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div><label className="input-label">Professional Headline</label><input className="input" placeholder="Senior Software Engineer | Go · Kubernetes · AWS" value={data.headline} onChange={set('headline')} /></div>
          <div><label className="input-label">Current Role</label><input className="input" placeholder="Senior Backend Engineer" value={data.currentRole} onChange={set('currentRole')} /></div>
          <div><label className="input-label">Current Company</label><input className="input" placeholder="Acme Corp" value={data.currentCompany} onChange={set('currentCompany')} /></div>
          <div><label className="input-label">Years of Experience</label><input className="input" type="number" min="0" max="40" value={data.yearsOfExperience} onChange={set('yearsOfExperience')} /></div>
          <div><label className="input-label">Summary</label><textarea className="input" style={{ height:90, resize:'vertical' }} placeholder="Write 2-3 sentences about your expertise and career goals..." value={data.summary} onChange={set('summary')} /></div>
        </div>
      );
      case 1: return (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div style={{ display:'flex', gap:8 }}>
            <input className="input" placeholder="Add a skill..." value={skillInput} onChange={e=>setSkillInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addSkill()} style={{ flex:1 }} />
            <select className="input" style={{ width:130 }} value={catInput} onChange={e=>setCatInput(e.target.value)}>
              <option value="technical">Technical</option><option value="soft">Soft Skills</option><option value="tools">Tools</option>
            </select>
            <button className="btn btn-primary" onClick={addSkill}>Add</button>
          </div>
          {['technical','soft','tools'].map(cat => data[cat]?.length>0 && (
            <div key={cat}>
              <div style={{ fontSize:11, color:'var(--txt3)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.06em' }}>{cat}</div>
              <div>{data[cat].map(s=><SkillTag key={s} cat={cat} s={s}/>)}</div>
            </div>
          ))}
          <div style={{ fontSize:11, color:'var(--txt3)', fontStyle:'italic' }}>💡 Add at least 5 technical skills for better AI matching</div>
        </div>
      );
      case 2: return (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ padding:16, background:'var(--bg3)', borderRadius:10, border:'1px solid var(--border)', textAlign:'center' }}>
            <div style={{ fontSize:24, marginBottom:8 }}>📋</div>
            <div style={{ fontSize:13, color:'var(--txt)' }}>Experience can be added after setup from your Profile page.</div>
            <div style={{ fontSize:11, color:'var(--txt3)', marginTop:4 }}>You can also upload your resume to auto-extract experience.</div>
          </div>
        </div>
      );
      case 3: return (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div><label className="input-label">Target Roles (comma separated)</label><input className="input" placeholder="Senior SWE, Backend Engineer, SDE-2" value={data.targetRoles.join(', ')} onChange={e=>setData(d=>({...d,targetRoles:e.target.value.split(',').map(x=>x.trim()).filter(Boolean)}))} /></div>
          <div><label className="input-label">Preferred Locations (comma separated)</label><input className="input" placeholder="Bangalore, Remote, Hyderabad" value={data.preferredLocations.join(', ')} onChange={e=>setData(d=>({...d,preferredLocations:e.target.value.split(',').map(x=>x.trim()).filter(Boolean)}))} /></div>
          <div className="grid-2">
            <div><label className="input-label">Min Salary (INR)</label><input className="input" placeholder="3000000" value={data.salaryMin} onChange={set('salaryMin')} /></div>
            <div><label className="input-label">Max Salary (INR)</label><input className="input" placeholder="6000000" value={data.salaryMax} onChange={set('salaryMax')} /></div>
          </div>
        </div>
      );
      case 4: return (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div><label className="input-label">LinkedIn URL</label><input className="input" placeholder="https://linkedin.com/in/username" value={data.linkedin} onChange={set('linkedin')} /></div>
          <div><label className="input-label">GitHub URL</label><input className="input" placeholder="https://github.com/username" value={data.github} onChange={set('github')} /></div>
          <div><label className="input-label">Portfolio URL</label><input className="input" placeholder="https://yourportfolio.dev" value={data.portfolio} onChange={set('portfolio')} /></div>
          <div style={{ padding:12, background:'rgba(255,107,0,0.05)', border:'1px solid rgba(255,107,0,0.15)', borderRadius:8, fontSize:12, color:'var(--txt2)' }}>📄 Resume upload will be available on your Profile page after setup.</div>
        </div>
      );
      case 5: return (
        <div style={{ textAlign:'center', padding:'30px 0' }}>
          <div style={{ fontSize:48, marginBottom:16 }}>🎉</div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:800, marginBottom:8 }}>You're all set!</div>
          <div style={{ fontSize:13, color:'var(--txt2)', marginBottom:24 }}>Your profile is ready. Connect your job platforms and start the automation to apply to 30 jobs daily.</div>
          <button className="btn btn-primary" style={{ padding:'11px 32px' }} onClick={() => navigate('/dashboard')}>Go to Dashboard →</button>
        </div>
      );
    }
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ width:'100%', maxWidth:520 }}>
        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:800 }}>Set Up Your Profile</div>
          <div style={{ fontSize:12, color:'var(--txt3)', marginTop:4 }}>Step {step+1} of {STEPS.length} — {STEPS[step]}</div>
        </div>
        {/* Progress */}
        <div style={{ display:'flex', gap:4, marginBottom:24 }}>
          {STEPS.map((_,i) => (
            <div key={i} style={{ flex:1, height:3, borderRadius:2, background: i<=step?'var(--accent)':'var(--border)', transition:'background 0.3s' }} />
          ))}
        </div>
        {/* Content */}
        <div className="card" style={{ padding:24 }}>
          {renderStep()}
          {step < 5 && (
            <div style={{ display:'flex', gap:8, marginTop:20 }}>
              {step > 0 && <button className="btn btn-ghost" style={{ flex:1 }} onClick={() => setStep(s=>s-1)}>← Back</button>}
              {step < 4
                ? <button className="btn btn-primary" style={{ flex:1 }} onClick={() => setStep(s=>s+1)}>Continue →</button>
                : <button className="btn btn-primary" style={{ flex:1 }} onClick={save} disabled={saving}>{saving?'Saving...':'Finish Setup →'}</button>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
