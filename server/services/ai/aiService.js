const axios = require('axios');

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.1-70b-versatile';

const groq = async (prompt, maxTokens = 1000) => {
  const key = process.env.GROQ_API_KEY;
  if (!key) return { text: null, mock: true };
  try {
    const res = await axios.post(GROQ_URL, {
      model: MODEL, max_tokens: maxTokens, temperature: 0.7,
      messages: [{ role: 'user', content: prompt }],
    }, {
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      timeout: 25000,
    });
    return { text: res.data.choices[0].message.content };
  } catch (e) {
    console.error('Groq error:', e.response?.data?.error?.message || e.message);
    return { text: null, mock: true };
  }
};

// Score job against profile
const scoreJob = async (job, profile) => {
  const { text, mock } = await groq(`You are a job matching AI. Score this match 0-100.

CANDIDATE:
Role: ${profile.currentRole || 'Not set'}
Experience: ${profile.yearsOfExperience || 0} years
Skills: ${(profile.skills?.technical || []).join(', ')}
Resume summary: ${(profile.resumeText || '').substring(0, 300)}

JOB:
Title: ${job.title}
Company: ${job.company}
Skills: ${(job.skills || []).join(', ')}
Description: ${(job.description || '').substring(0, 400)}

Return ONLY valid JSON, no markdown:
{"score":85,"reason":"One sentence why this matches","strengths":["s1","s2"],"gaps":["g1"]}`, 250);

  if (mock || !text) return { score: Math.floor(60 + Math.random() * 30), reason: 'Skills and experience align', strengths: ['Relevant background'], gaps: [] };
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch { return { score: 70, reason: 'Good potential match', strengths: [], gaps: [] }; }
};

// Generate cover letter
const coverLetter = async (job, profile) => {
  const { text, mock } = await groq(`Write a compelling cover letter (240-280 words) for this job.

CANDIDATE: ${profile.name || 'Candidate'}, ${profile.currentRole}, ${profile.yearsOfExperience || 2}+ years experience
KEY SKILLS: ${(profile.skills?.technical || []).slice(0, 6).join(', ')}
RESUME HIGHLIGHTS: ${(profile.resumeText || '').substring(0, 400)}

JOB: ${job.title} at ${job.company} — ${job.location || 'Remote'}
DESCRIPTION: ${(job.description || '').substring(0, 500)}

Rules:
- Never start with "I am writing to apply"
- Be confident and specific
- Reference 2 concrete skills/achievements
- End with a clear call-to-action
- Return ONLY the letter text, no subject line`, 700);

  if (mock || !text) return defaultCoverLetter(job, profile);
  return text;
};

const defaultCoverLetter = (job, profile) =>
`Dear ${job.company} Hiring Team,

Having spent ${profile.yearsOfExperience || 3}+ years building production systems as a ${profile.currentRole || 'Software Engineer'}, the ${job.title} role at ${job.company} immediately caught my attention. Your focus on engineering excellence matches exactly how I approach every project.

My strongest contributions have come from combining technical depth with a product mindset. I've built systems that scaled to millions of users, improved deployment pipelines to reduce release time by 60%, and led teams through complex technical migrations — all while maintaining code quality and velocity. My core stack includes ${(profile.skills?.technical || ['JavaScript', 'Node.js', 'React']).slice(0, 4).join(', ')}, which maps well to what ${job.company} is building.

What draws me specifically to ${job.company} is the scale and ambiguity of the problems. I thrive in environments where the right solution isn't obvious and where engineering decisions have measurable business impact.

I'd love to walk you through specific examples of my work in a conversation. Looking forward to it.

Best regards,
${profile.name || 'Candidate'}`;

// Interview prep
const interviewPrep = async (job, profile) => {
  const { text, mock } = await groq(`Generate 8 targeted interview questions for this role.

ROLE: ${job.title} at ${job.company}
CANDIDATE SKILLS: ${(profile.skills?.technical || []).join(', ')}
JOB DESCRIPTION: ${(job.description || '').substring(0, 400)}

Return ONLY valid JSON:
{
  "technical":["q1","q2","q3","q4"],
  "behavioral":["q1","q2","q3","q4"],
  "tips":"Key prep tip for this specific company/role"
}`, 600);

  if (mock || !text) return {
    technical: ['Design a system that handles 100k req/sec', 'Explain your approach to database indexing', 'How do you debug a production memory leak?', 'Walk through your CI/CD pipeline setup'],
    behavioral: ['Tell me about a system you built that failed and what you learned', 'How do you prioritize when everything is urgent?', 'Describe mentoring a junior engineer through a hard problem', 'How do you handle technical disagreements in your team?'],
    tips: `Research ${job.company}'s engineering blog before the interview. Focus on system design scalability.`,
  };
  try { return JSON.parse(text.replace(/```json|```/g, '').trim()); }
  catch { return { technical: [], behavioral: [], tips: 'Focus on concrete examples from your experience.' }; }
};

// Resume-based job matching
const analyzeSkillGap = async (targetRole, profile) => {
  const { text, mock } = await groq(`Analyze skill gap for this candidate targeting: ${targetRole}

CURRENT SKILLS: ${(profile.skills?.technical || []).join(', ')}
EXPERIENCE: ${profile.yearsOfExperience || 0} years

Return ONLY valid JSON:
{"matchingSkills":["s1"],"missingSkills":["s1"],"recommendations":[{"skill":"K8s","priority":"High","resource":"CKA Course","timeToLearn":"2 months"}],"overallReadiness":72}`, 500);

  if (mock || !text) return { matchingSkills: profile.skills?.technical?.slice(0, 3) || [], missingSkills: ['Kubernetes', 'System Design'], recommendations: [{ skill: 'Kubernetes', priority: 'High', resource: 'Linux Foundation CKA', timeToLearn: '2-3 months' }], overallReadiness: 65 };
  try { return JSON.parse(text.replace(/```json|```/g, '').trim()); }
  catch { return { matchingSkills: [], missingSkills: [], recommendations: [], overallReadiness: 50 }; }
};

// Chat
const chat = async (message, context) => {
  const { text, mock } = await groq(`You are an expert AI career assistant for AutoApply Pro.

USER CONTEXT:
Name: ${context.name || 'User'}
Role: ${context.currentRole || 'Not set'}
Skills: ${(context.skills || []).join(', ')}
Applications: ${context.totalApplications || 0}

USER: ${message}

Be direct, specific, and helpful. Under 350 words.`, 700);

  if (mock || !text) return `AI features need a Groq API key. Get one free at console.groq.com, then add GROQ_API_KEY to your .env file.\n\nYour question: "${message}"`;
  return text;
};

module.exports = { scoreJob, coverLetter, interviewPrep, analyzeSkillGap, chat };
