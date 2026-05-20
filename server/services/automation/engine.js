const Application = require('../../models/Application');
const Profile = require('../../models/Profile');
const { scoreJob, coverLetter } = require('../ai/aiService');
const { fetchJobsForProfile } = require('../jobs/jobFetcher');

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// In-memory session tracker
const sessions = new Map();

const getSession = (userId) => sessions.get(userId.toString()) || null;

const startSession = async (userId, profile, dailyLimit) => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayCount = await Application.countDocuments({ userId, createdAt: { $gte: today } }).catch(() => 0);

  if (todayCount >= dailyLimit) return { error: `Daily limit of ${dailyLimit} already reached` };
  if (sessions.has(userId.toString())) return { error: 'Auto-apply already running' };

  const remaining = dailyLimit - todayCount;
  const session = { status: 'starting', count: 0, target: remaining, jobsFound: 0, startedAt: new Date(), currentCompany: null };
  sessions.set(userId.toString(), session);

  // Run background, don't await
  _engine(userId.toString(), profile, remaining).catch(e => {
    console.error('[AutoApply Engine Error]', e.message);
    sessions.delete(userId.toString());
  });

  return { session };
};

const stopSession = (userId) => {
  const s = sessions.get(userId.toString());
  if (!s) return false;
  s.status = 'stopping';
  sessions.set(userId.toString(), s);
  setTimeout(() => sessions.delete(userId.toString()), 3000);
  return true;
};

async function _engine(userId, profile, target) {
  const update = (data) => {
    const s = sessions.get(userId);
    if (s) sessions.set(userId, { ...s, ...data });
  };

  try {
    update({ status: 'fetching_jobs' });

    // Fetch real jobs
    const rawJobs = await fetchJobsForProfile(profile);
    update({ status: 'scoring', jobsFound: rawJobs.length });

    if (!rawJobs.length) {
      update({ status: 'no_jobs_found' });
      await sleep(2000);
      sessions.delete(userId);
      return;
    }

    // Score each job against resume
    const scored = [];
    const minScore = profile.preferences?.minMatchScore || 60;

    for (const job of rawJobs) {
      const s = sessions.get(userId);
      if (!s || s.status === 'stopping') break;

      try {
        const match = await scoreJob(job, profile);
        if (match.score >= minScore) {
          scored.push({ ...job, matchScore: match.score, matchReason: match.reason, strengths: match.strengths, gaps: match.gaps });
        }
      } catch { continue; }
      await sleep(300); // Rate limit AI calls
    }

    const topJobs = scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, target);
    update({ status: 'applying', jobsScored: scored.length });

    for (const job of topJobs) {
      const s = sessions.get(userId);
      if (!s || s.status === 'stopping') break;

      // Skip duplicates
      const exists = await Application.findOne({ userId, company: job.company, jobTitle: job.title }).catch(() => null);
      if (exists) continue;

      update({ currentCompany: job.company, status: 'applying' });

      // Create application record
      const app = await Application.create({
        userId,
        jobTitle: job.title,
        company: job.company,
        companyLogo: job.companyLogo,
        location: job.location,
        locationType: job.locationType,
        platform: job.platform,
        salary: job.salary,
        jobDescription: job.description,
        skills: job.skills,
        applyUrl: job.applyUrl,
        matchScore: job.matchScore,
        matchReason: job.matchReason,
        strengths: job.strengths,
        gaps: job.gaps,
        status: 'tailoring',
        isAutoApplied: true,
      });

      // Generate AI cover letter
      await sleep(rand(1500, 3000));
      try {
        const cl = await coverLetter(job, {
          name: profile.name,
          currentRole: profile.currentRole,
          yearsOfExperience: profile.yearsOfExperience,
          skills: profile.skills,
          resumeText: profile.resumeText,
        });
        await Application.findByIdAndUpdate(app._id, { coverLetter: cl, status: 'applied', appliedAt: new Date() });
      } catch {
        await Application.findByIdAndUpdate(app._id, { status: 'applied', appliedAt: new Date() });
      }

      await Profile.findOneAndUpdate({ userId }, { $inc: { totalApplications: 1 } });

      const cur = sessions.get(userId);
      if (cur) sessions.set(userId, { ...cur, count: cur.count + 1 });

      // Human-like delay between applications (5–15 seconds)
      await sleep(rand(5000, 15000));
    }
  } finally {
    sessions.delete(userId);
  }
}

module.exports = { getSession, startSession, stopSession };
