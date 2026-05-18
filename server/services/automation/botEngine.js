const Application = require('../../models/Application');
const Profile = require('../../models/Profile');
const { scoreJobAgainstProfile, generateCoverLetter } = require('../ai/claudeService');
const { getMockJobs } = require('../../utils/mockData');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

class AutomationEngine {
  constructor() {
    this.running = new Map(); // userId -> { status, count, startedAt }
  }

  isRunning(userId) {
    return this.running.has(userId.toString());
  }

  getStatus(userId) {
    return this.running.get(userId.toString()) || null;
  }

  async startAutomation(userId) {
    if (this.isRunning(userId)) {
      return { success: false, message: 'Automation already running' };
    }

    const profile = await Profile.findOne({ userId });
    if (!profile) return { success: false, message: 'Profile not found' };

    const dailyLimit = profile.preferences?.dailyApplyCount || 30;
    
    // Check how many already applied today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await Application.countDocuments({
      userId,
      appliedAt: { $gte: today },
      status: { $in: ['applied', 'viewed', 'shortlisted'] },
    });

    if (todayCount >= dailyLimit) {
      return { success: false, message: `Daily limit of ${dailyLimit} applications reached` };
    }

    const remaining = dailyLimit - todayCount;
    this.running.set(userId.toString(), { status: 'running', count: 0, target: remaining, startedAt: new Date() });

    // Run in background (non-blocking)
    this._runAutomationLoop(userId, profile, remaining).catch(console.error);

    return { success: true, message: `Automation started, targeting ${remaining} applications` };
  }

  async _runAutomationLoop(userId, profile, targetCount) {
    try {
      const jobs = getMockJobs(50);
      const scored = [];

      for (const job of jobs) {
        try {
          const match = await scoreJobAgainstProfile(job, {
            name: profile.currentRole,
            currentRole: profile.currentRole,
            yearsOfExperience: profile.yearsOfExperience,
            skills: profile.skills,
          });
          if (match.score >= 60) {
            scored.push({ ...job, matchScore: match.score, matchReason: match.reason, strengths: match.strengths, gaps: match.gaps });
          }
        } catch { continue; }
      }

      const top = scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, targetCount);

      const state = this.running.get(userId.toString());
      if (!state || state.status === 'stopped') return;

      for (const job of top) {
        const currentState = this.running.get(userId.toString());
        if (!currentState || currentState.status === 'stopped') break;

        // Check if already applied
        const existing = await Application.findOne({ userId, company: job.company, jobTitle: job.title });
        if (existing) continue;

        // Create queued application
        const app = await Application.create({
          userId, jobTitle: job.title, company: job.company,
          companyLogo: job.companyLogo, location: job.location,
          platform: job.platform, salary: job.salary,
          jobDescription: job.description, matchScore: job.matchScore,
          matchReason: job.matchReason, strengths: job.strengths, gaps: job.gaps,
          status: 'tailoring',
        });

        await sleep(randomBetween(2000, 5000));

        // Generate cover letter
        try {
          const coverLetter = await generateCoverLetter(job, {
            name: 'Candidate', currentRole: profile.currentRole,
            yearsOfExperience: profile.yearsOfExperience, skills: profile.skills,
          });
          await Application.findByIdAndUpdate(app._id, {
            coverLetter, status: 'applied', appliedAt: new Date(),
          });
        } catch {
          await Application.findByIdAndUpdate(app._id, { status: 'applied', appliedAt: new Date() });
        }

        // Update profile counter
        await Profile.findOneAndUpdate({ userId }, { $inc: { totalApplications: 1 } });

        currentState.count++;
        this.running.set(userId.toString(), currentState);

        await sleep(randomBetween(15000, 45000));
      }

      this.running.delete(userId.toString());
    } catch (error) {
      console.error('Automation loop error:', error);
      this.running.delete(userId.toString());
    }
  }

  stopAutomation(userId) {
    const state = this.running.get(userId.toString());
    if (state) {
      state.status = 'stopped';
      this.running.set(userId.toString(), state);
      setTimeout(() => this.running.delete(userId.toString()), 5000);
      return { success: true, message: 'Automation stopping...' };
    }
    return { success: false, message: 'No automation running' };
  }
}

module.exports = new AutomationEngine();
