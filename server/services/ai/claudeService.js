const Anthropic = require('@anthropic-ai/sdk');
const { ANTHROPIC_API_KEY, CLAUDE_MODEL } = require('../../config/env');

let client = null;
if (ANTHROPIC_API_KEY) {
  client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
}

const callClaude = async (prompt, maxTokens = 1000) => {
  if (!client) {
    return { text: 'AI service not configured. Please add ANTHROPIC_API_KEY to your .env file.', mock: true };
  }
  try {
    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    });
    return { text: response.content[0].text };
  } catch (error) {
    console.error('Claude API error:', error.message);
    throw new Error('AI service error: ' + error.message);
  }
};

const scoreJobAgainstProfile = async (job, profile) => {
  const prompt = `You are a job matching AI. Score this job match from 0-100 based on candidate profile.

CANDIDATE PROFILE:
Name: ${profile.name || 'Candidate'}
Current Role: ${profile.currentRole || 'Not specified'}
Years of Experience: ${profile.yearsOfExperience || 0}
Technical Skills: ${profile.skills?.technical?.join(', ') || 'Not specified'}
Tools: ${profile.skills?.tools?.join(', ') || 'Not specified'}

JOB:
Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Description: ${(job.description || '').substring(0, 500)}
Required Skills: ${(job.skills || []).join(', ')}

Respond ONLY with valid JSON (no markdown):
{"score": 85, "reason": "Brief 1-sentence explanation", "strengths": ["strength1", "strength2"], "gaps": ["gap1"]}`;

  try {
    const result = await callClaude(prompt, 300);
    if (result.mock) return { score: Math.floor(60 + Math.random() * 35), reason: 'Strong profile match', strengths: ['Relevant experience'], gaps: [] };
    const cleaned = result.text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return { score: Math.floor(60 + Math.random() * 35), reason: 'Good potential match', strengths: ['Experience aligns'], gaps: [] };
  }
};

const generateCoverLetter = async (job, profile) => {
  const prompt = `Write a compelling, personalized cover letter (250-300 words) for this job application.

CANDIDATE: ${profile.name}, ${profile.currentRole}, ${profile.yearsOfExperience} years experience
KEY SKILLS: ${profile.skills?.technical?.slice(0, 8).join(', ')}
TOP ACHIEVEMENTS: ${profile.experience?.[0]?.achievements?.slice(0, 2).join('; ') || 'Not specified'}

JOB: ${job.title} at ${job.company}
LOCATION: ${job.location}
JOB DESCRIPTION: ${(job.description || '').substring(0, 600)}

Write a professional, confident cover letter. Do NOT use generic phrases like "I am writing to apply". 
Highlight 2-3 specific relevant achievements. Make it personalized to this company.
Return ONLY the cover letter text, no subject line or formatting markup.`;

  try {
    const result = await callClaude(prompt, 600);
    if (result.mock) return getMockCoverLetter(profile, job);
    return result.text;
  } catch {
    return getMockCoverLetter(profile, job);
  }
};

const getMockCoverLetter = (profile, job) => `Dear ${job.company} Team,

Having spent ${profile.yearsOfExperience || 3}+ years building scalable systems as a ${profile.currentRole || 'Software Engineer'}, I was immediately drawn to the ${job.title} role. ${job.company}'s reputation for engineering excellence aligns perfectly with how I approach every project.

In my current role, I've consistently delivered high-impact solutions — from architecting distributed systems that handle millions of requests to leading cross-functional teams through complex migrations. My expertise in ${profile.skills?.technical?.slice(0, 3).join(', ') || 'backend development'} positions me well to contribute from day one.

What excites me most about ${job.company} is the opportunity to work on problems at scale. I thrive in environments where engineering decisions have real business impact, and I bring both the technical depth and collaborative mindset needed to succeed.

I would love to discuss how my background can contribute to ${job.company}'s continued growth.

Best regards,
${profile.name || 'Candidate'}`;

const generateInterviewQuestions = async (job, profile) => {
  const prompt = `Generate 8 targeted interview questions for this role, split between technical and behavioral.

ROLE: ${job.title} at ${job.company}
CANDIDATE SKILLS: ${profile.skills?.technical?.join(', ')}
JOB DESCRIPTION: ${(job.description || '').substring(0, 400)}

Return ONLY valid JSON:
{
  "technical": ["question1", "question2", "question3", "question4"],
  "behavioral": ["question1", "question2", "question3", "question4"],
  "tips": "Key focus area for this interview"
}`;

  try {
    const result = await callClaude(prompt, 500);
    if (result.mock) return getMockInterviewQuestions(job);
    const cleaned = result.text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return getMockInterviewQuestions(job);
  }
};

const getMockInterviewQuestions = (job) => ({
  technical: [
    `Design a scalable ${job.title?.includes('Backend') ? 'API gateway' : 'system'} that handles 100k requests/second`,
    'Explain your approach to database optimization and query performance',
    'How would you implement a distributed caching layer?',
    'Walk me through how you debug a production outage',
  ],
  behavioral: [
    'Tell me about a time you made a technical decision that had significant business impact',
    'Describe a situation where you disagreed with your team\'s technical direction',
    'How do you prioritize technical debt vs feature development?',
    'Give an example of mentoring a junior engineer',
  ],
  tips: `Focus on system design scalability and concrete examples from your experience with ${job.company}'s tech stack.`,
});

const analyzeSkillGap = async (targetRole, profile) => {
  const prompt = `Analyze skill gaps between this candidate and the target role.

CANDIDATE SKILLS: ${profile.skills?.technical?.join(', ')}
EXPERIENCE: ${profile.yearsOfExperience} years
TARGET ROLE: ${targetRole}

Return ONLY valid JSON:
{
  "matchingSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"],
  "recommendations": [{"skill": "Kubernetes", "priority": "High", "resource": "Certified Kubernetes Administrator course", "timeToLearn": "2-3 months"}],
  "overallReadiness": 75
}`;

  try {
    const result = await callClaude(prompt, 500);
    if (result.mock) return getMockSkillGap(profile);
    const cleaned = result.text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return getMockSkillGap(profile);
  }
};

const getMockSkillGap = (profile) => ({
  matchingSkills: profile.skills?.technical?.slice(0, 4) || ['JavaScript', 'Node.js'],
  missingSkills: ['Kubernetes', 'System Design (advanced)', 'Go'],
  recommendations: [
    { skill: 'Kubernetes', priority: 'High', resource: 'Linux Foundation CKA Course', timeToLearn: '2-3 months' },
    { skill: 'System Design', priority: 'High', resource: 'Designing Data-Intensive Applications book', timeToLearn: '1-2 months' },
  ],
  overallReadiness: 72,
});

const chatWithAI = async (message, context) => {
  const prompt = `You are an expert AI career assistant for AutoApply Pro. You help candidates with job applications, resume optimization, interview prep, and career strategy.

USER CONTEXT:
- Name: ${context.name || 'Candidate'}
- Current Role: ${context.currentRole || 'Software Engineer'}  
- Skills: ${context.skills?.join(', ') || 'Not specified'}
- Total Applications: ${context.totalApplications || 0}
- Interviews: ${context.totalInterviews || 0}

USER MESSAGE: ${message}

Provide a helpful, specific, actionable response. Be direct and professional. If generating content like a cover letter, provide the actual content. Keep responses under 400 words.`;

  try {
    const result = await callClaude(prompt, 800);
    if (result.mock) return `I'm here to help with your job search! However, the AI service isn't configured yet. Please add your ANTHROPIC_API_KEY to the .env file to enable full AI capabilities.\n\nYour question: "${message}"\n\nI can help you with cover letters, interview prep, salary negotiation, and skill gap analysis once the API key is configured.`;
    return result.text;
  } catch (error) {
    return 'Sorry, I encountered an error. Please try again in a moment.';
  }
};

module.exports = { scoreJobAgainstProfile, generateCoverLetter, generateInterviewQuestions, analyzeSkillGap, chatWithAI };
