const axios = require('axios');

// Remotive - free, no key needed
const fetchRemotive = async (keywords) => {
  try {
    const results = [];
    for (const kw of keywords.slice(0, 2)) {
      const res = await axios.get(
        `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(kw)}&limit=15`,
        { timeout: 8000 }
      );
      if (res.data?.jobs?.length) {
        results.push(...res.data.jobs.map(j => ({
          externalId: `remotive_${j.id}`,
          platform: 'linkedin',
          title: j.title,
          company: j.company_name,
          companyLogo: j.company_logo || '',
          location: j.candidate_required_location || 'Worldwide',
          locationType: 'remote',
          salary: j.salary || '',
          description: (j.description || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').substring(0, 1200),
          skills: Array.isArray(j.tags) ? j.tags.slice(0, 10) : [],
          jobType: j.job_type || 'full_time',
          postedAt: new Date(j.publication_date),
          applyUrl: j.url,
          industry: j.category || 'Software Development',
          isRemote: true,
        })));
      }
    }
    return results;
  } catch (e) {
    console.error('Remotive error:', e.message);
    return [];
  }
};

// Adzuna - free tier (developer.adzuna.com)
const fetchAdzuna = async (keyword, appId, appKey) => {
  if (!appId || !appKey) return [];
  try {
    const res = await axios.get(
      `https://api.adzuna.com/v1/api/jobs/in/search/1`,
      {
        params: { app_id: appId, app_key: appKey, results_per_page: 20, what: keyword, where: 'bangalore', 'content-type': 'application/json' },
        timeout: 8000,
      }
    );
    return (res.data?.results || []).map(j => ({
      externalId: `adzuna_${j.id}`,
      platform: 'indeed',
      title: j.title,
      company: j.company?.display_name || 'Company',
      location: j.location?.display_name || 'India',
      locationType: 'onsite',
      salary: j.salary_min ? `₹${Math.round(j.salary_min / 100000)}–${Math.round((j.salary_max || j.salary_min * 1.3) / 100000)}L` : '',
      description: (j.description || '').substring(0, 1200),
      skills: [],
      postedAt: new Date(j.created),
      applyUrl: j.redirect_url,
      industry: j.category?.label || 'Technology',
      isRemote: false,
    }));
  } catch (e) {
    console.error('Adzuna error:', e.message);
    return [];
  }
};

const fetchJobsForProfile = async (profile) => {
  const roles = profile.preferences?.targetRoles?.length
    ? profile.preferences.targetRoles.slice(0, 3)
    : [profile.currentRole || 'software engineer', 'backend engineer'];

  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  const [remotiveJobs, adzunaJobs] = await Promise.all([
    fetchRemotive(roles),
    appId ? fetchAdzuna(roles[0], appId, appKey) : Promise.resolve([]),
  ]);

  // Deduplicate by title + company
  const seen = new Set();
  const all = [...remotiveJobs, ...adzunaJobs].filter(j => {
    const key = `${j.title}|${j.company}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return all;
};

module.exports = { fetchJobsForProfile, fetchRemotive };
