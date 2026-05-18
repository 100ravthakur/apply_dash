const axios = require('axios');
const { GROQ_API_KEY } = require('../../config/env');

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.1-70b-versatile';

const callGroq = async (prompt, maxTokens = 1000) => {
  if (!GROQ_API_KEY) {
    return { text: null, mock: true };
  }
  try {
    const res = await axios.post(
      GROQ_URL,
      {
        model: MODEL,
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 20000,
      }
    );
    return { text: res.data.choices[0].message.content };
  } catch (error) {
    console.error('Groq API error:', error.response?.data || error.message);
    throw new Error('AI service error: ' + (error.response?.data?.error?.message || error.message));
  }
};

const scoreJobAgainstProfile = async (job, profile) => {
  const prompt = `You are a job matching AI. Score this job match from 0-100.

CANDIDATE:
Role: ${profile.currentRole || 'Not specified'}
Experience: ${profile.yearsOfExperience || 0} years
Skills: ${profile.skills?.technical?.join(', ') || 'Not specified'}

JOB:
Title: ${job.title}
Company: ${job.company}
Skills Required: ${(job.skills || []).join(', ')}
Description: ${(job.description || '').substring(0, 400)}

Respond ONLY with valid JSON, no markdown:
{"score": 85, "reason": "One sentence explanation", "strengths": ["strength1", "strength2"], "gaps": ["gap1"]}`;

  try {
    const result = await callGroq(prompt, 300);
    if (result.mock) return getMockScore();
    const cleaned = result.text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return parsed;
  } catch {
    return getMockScore();
  }
};

const getMockScore = () => ({
  score: Math.floor(65 + Math.random() * 30),
  reason: 'Strong profile match based on your experience and skills',
  strengths: ['Relevant experience', 'Technical skills align'],
  gaps: [],
});

const generateCoverLetter = async (job, profile) => {
  const prompt = `Write a compelling cover letter (250-300 words) for this job application.

CANDIDATE: ${profile.name || 'Candidate'}, ${profile.currentRole || 'Software Engineer'}, ${profile.yearsOfExperience || 3} years experience
SKILLS: ${profile.skills?.technical?.slice(0, 6).join(', ') || 'Software Development'}

JOB: ${job.title} at ${job.company}
LOCATION: ${job.location || 'Not specified'}
JOB DESCRIPTION: ${(job.description || '').substring(0, 500)}

Write a professional, confident cover letter. Do NOT start with "I am writing to apply". 
Highlight 2-3 specific skills relevant to this role. Be direct and impactful.
Return ONLY the cover letter text, no subject line, no formatting markup.`;

  try {
    const result = await callGroq(prompt, 600);
    if (result.mock) return getMockCoverLetter(profile, job);
    return result.text;
  } catch {
    return getMockCoverLetter(profile, job);
  }
};

const getMockCoverLetter = (profile, job) =>
  `Dear ${job.company} Team,

Having spent ${profile.yearsOfExperience || 3}+ years building scalable systems as a ${profile.currentRole || 'Software Engineer'}, I was immediately drawn to the ${job.title} role. ${job.company}'s reputation for engineering excellence aligns perfectly with how I approach every project.

In my current role, I've consistently delivered high-impact solutions — architecting distributed systems that handle millions of requests and leading teams through complex technical migrations. My expertise in ${profile.skills?.technical?.slice(0, 3).join(', ') || 'backend development'} positions me well to contribute from day one.

What excites me most about ${job.company} is the opportunity to work on problems at scale. I thrive in environments where engineering decisions have real business impact, and I bring both the technical depth and collaborative mindset needed to succeed in this role.

I would love to discuss how my background can contribute to ${job.company}'s continued growth.

Best regards,
${profile.name || 'Candidate'}`;

const generateInterviewQuestions = async (job, profile) => {
  const prompt = `Generate 8 targeted interview questions for this role.

ROLE: ${job.title} at ${job.company}
CANDIDATE SKILLS: ${profile.skills?.technical?.join(', ') || 'Software Engineering'}
JOB DESCRIPTION: ${(job.description || '').substring(0, 400)}

Return ONLY valid JSON, no markdown:
{
  "technical": ["question1", "question2", "question3", "question4"],
  "behavioral": ["question1", "question2", "question3", "question4"],
  "tips": "Key focus area for this interview"
}`;

  try {
    const result = await callGroq(prompt, 600);
    if (result.mock) return getMockInterviewQuestions(job);
    const cleaned = result.text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return getMockInterviewQuestions(job);
  }
};

const getMockInterviewQuestions = (job) => ({
  technical: [
    `Design a scalable system for ${job.title?.includes('Backend') ? 'a high-traffic API' : 'real-time data processing'}`,
    'Explain your approach to database optimization and query performance tuning',
    'How would you implement a distributed caching layer with Redis?',
    'Walk me through debugging a memory leak in a production Node.js service',
  ],
  behavioral: [
    'Tell me about a time you made a technical decision that had significant business impact',
    'Describe a situation where you disagreed with your team\'s technical direction',
    'How do you prioritize technical debt vs new feature development?',
    'Give an example of mentoring a junior engineer through a difficult problem',
  ],
  tips: `Focus on system design scalability and concrete examples. Research ${job.company}'s tech stack beforehand.`,
});

const analyzeSkillGap = async (targetRole, profile) => {
  const prompt = `Analyze the skill gap for this candidate targeting a new role.

CANDIDATE SKILLS: ${profile.skills?.technical?.join(', ') || 'Not specified'}
YEARS EXPERIENCE: ${profile.yearsOfExperience || 0}
TARGET ROLE: ${targetRole}

Return ONLY valid JSON, no markdown:
{
  "matchingSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"],
  "recommendations": [{"skill": "Kubernetes", "priority": "High", "resource": "Course name or book", "timeToLearn": "2-3 months"}],
  "overallReadiness": 75
}`;

  try {
    const result = await callGroq(prompt, 600);
    if (result.mock) return getMockSkillGap(profile);
    const cleaned = result.text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return getMockSkillGap(profile);
  }
};

const getMockSkillGap = (profile) => ({
  matchingSkills: profile.skills?.technical?.slice(0, 4) || ['JavaScript', 'Node.js', 'React'],
  missingSkills: ['Kubernetes', 'System Design (advanced)', 'Go'],
  recommendations: [
    { skill: 'Kubernetes', priority: 'High', resource: 'Linux Foundation CKA Course', timeToLearn: '2-3 months' },
    { skill: 'System Design', priority: 'High', resource: 'Designing Data-Intensive Applications', timeToLearn: '1-2 months' },
    { skill: 'Go', priority: 'Medium', resource: 'Tour of Go + Go by Example', timeToLearn: '1 month' },
  ],
  overallReadiness: 72,
});

const chatWithAI = async (message, context) => {
  const prompt = `You are an expert AI career assistant for AutoApply Pro. Help candidates with job applications, resume optimization, interview prep, and career strategy.

USER CONTEXT:
- Name: ${context.name || 'Candidate'}
- Current Role: ${context.currentRole || 'Software Engineer'}
- Skills: ${context.skills?.join(', ') || 'Not specified'}
- Total Applications: ${context.totalApplications || 0}
- Interviews: ${context.totalInterviews || 0}

USER MESSAGE: ${message}

Provide a helpful, specific, actionable response. Be direct and professional. Keep response under 400 words.`;

  try {
    const result = await callGroq(prompt, 800);
    if (result.mock) {
      return `I'd love to help with that! However, the AI service isn't configured yet.\n\nTo enable AI features:\n1. Go to https://console.groq.com\n2. Sign up for free (no credit card needed)\n3. Create an API key\n4. Add GROQ_API_KEY=your_key to your .env file\n5. Restart the server\n\nGroq is 100% free and takes 2 minutes to set up! 🚀`;
    }
    return result.text;
  } catch (error) {
    return 'Sorry, I encountered an error. Please try again in a moment.';
  }
};

module.exports = {
  scoreJobAgainstProfile,
  generateCoverLetter,
  generateInterviewQuestions,
  analyzeSkillGap,
  chatWithAI,
};