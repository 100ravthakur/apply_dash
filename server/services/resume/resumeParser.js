const axios = require('axios');

const extractText = async (buffer, mimetype) => {
  if (mimetype === 'application/pdf') {
    try {
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(buffer);
      return data.text?.trim() || '';
    } catch (e) { console.error('PDF parse:', e.message); return ''; }
  }
  if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    try {
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      return result.value?.trim() || '';
    } catch (e) { console.error('DOCX parse:', e.message); return ''; }
  }
  return buffer.toString('utf-8').trim();
};

const parseWithAI = async (resumeText) => {
  const key = process.env.GROQ_API_KEY;
  if (!key) return getDefaultParse(resumeText);

  const prompt = `Parse this resume and extract structured data. Return ONLY valid JSON, no markdown, no explanation.

RESUME:
${resumeText.substring(0, 4500)}

JSON format:
{
  "name": "Full Name or empty string",
  "email": "email or empty",
  "phone": "phone or empty",
  "currentRole": "Most recent job title",
  "currentCompany": "Most recent company",
  "yearsOfExperience": 5,
  "headline": "Professional headline in 1 concise line",
  "summary": "2-3 sentence professional summary based on their background",
  "skills": {
    "technical": ["skill1", "skill2"],
    "tools": ["tool1", "tool2"],
    "soft": ["Communication", "Leadership"],
    "languages": ["English", "Hindi"]
  },
  "experience": [
    {
      "company": "Company",
      "role": "Title",
      "startDate": "2022-01",
      "endDate": "present",
      "isCurrent": true,
      "description": "Brief role description",
      "achievements": ["Measurable achievement 1", "Achievement 2"]
    }
  ],
  "education": [
    {
      "institution": "University",
      "degree": "B.Tech",
      "field": "Computer Science",
      "startYear": 2018,
      "endYear": 2022
    }
  ],
  "socialLinks": { "linkedin": "", "github": "", "portfolio": "" },
  "targetRoles": ["Senior Software Engineer", "Backend Engineer"],
  "preferredLocations": ["Bangalore", "Remote"],
  "atsScore": 72,
  "keyStrengths": ["strength1", "strength2", "strength3"]
}`;

  try {
    const res = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'llama-3.1-70b-versatile',
      max_tokens: 2500,
      temperature: 0.1,
      messages: [{ role: 'user', content: prompt }],
    }, {
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      timeout: 30000,
    });

    const text = res.data.choices[0].message.content;
    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return parsed;
  } catch (e) {
    console.error('Resume AI parse error:', e.message);
    return getDefaultParse(resumeText);
  }
};

const getDefaultParse = (resumeText) => {
  // Extract basic info from text with simple regex
  const emailMatch = resumeText.match(/[\w.-]+@[\w.-]+\.\w+/);
  const phoneMatch = resumeText.match(/[\+]?[\d\s\-\(\)]{10,}/);
  return {
    name: '',
    email: emailMatch?.[0] || '',
    phone: phoneMatch?.[0]?.trim() || '',
    currentRole: 'Software Engineer',
    currentCompany: '',
    yearsOfExperience: 2,
    headline: 'Software Engineer | Full Stack Developer',
    summary: 'Experienced software engineer with a strong technical background.',
    skills: { technical: ['JavaScript', 'React', 'Node.js'], tools: ['Git', 'Docker'], soft: ['Problem Solving'], languages: ['English'] },
    experience: [],
    education: [],
    socialLinks: { linkedin: '', github: '', portfolio: '' },
    targetRoles: ['Software Engineer', 'Full Stack Developer'],
    preferredLocations: ['Bangalore', 'Remote'],
    atsScore: 60,
    keyStrengths: ['Technical expertise', 'Problem solving', 'Adaptability'],
  };
};

module.exports = { extractText, parseWithAI };
