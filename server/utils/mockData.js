const MOCK_COMPANIES = [
  { name: 'Google', logo: '🔵', industry: 'Technology', platform: 'linkedin' },
  { name: 'Microsoft', logo: '🟦', industry: 'Technology', platform: 'linkedin' },
  { name: 'Amazon', logo: '🟠', industry: 'E-commerce', platform: 'indeed' },
  { name: 'Stripe', logo: '🟣', industry: 'Fintech', platform: 'linkedin' },
  { name: 'Razorpay', logo: '🔷', industry: 'Fintech', platform: 'naukri' },
  { name: 'Flipkart', logo: '🟡', industry: 'E-commerce', platform: 'linkedin' },
  { name: 'CRED', logo: '⚫', industry: 'Fintech', platform: 'indeed' },
  { name: 'Swiggy', logo: '🟠', industry: 'Foodtech', platform: 'naukri' },
  { name: 'Zomato', logo: '🔴', industry: 'Foodtech', platform: 'linkedin' },
  { name: 'PhonePe', logo: '🟣', industry: 'Fintech', platform: 'indeed' },
  { name: 'Meesho', logo: '🩷', industry: 'E-commerce', platform: 'linkedin' },
  { name: 'Zepto', logo: '🟢', industry: 'Qcommerce', platform: 'naukri' },
  { name: 'Freshworks', logo: '🟢', industry: 'SaaS', platform: 'linkedin' },
  { name: 'Salesforce', logo: '🔵', industry: 'CRM', platform: 'indeed' },
  { name: 'Adobe', logo: '🔴', industry: 'Software', platform: 'linkedin' },
  { name: 'Atlassian', logo: '🔵', industry: 'DevTools', platform: 'indeed' },
  { name: 'Twilio', logo: '🔴', industry: 'Communications', platform: 'linkedin' },
  { name: 'Databricks', logo: '🟠', industry: 'Data', platform: 'linkedin' },
  { name: 'HashiCorp', logo: '⚪', industry: 'DevOps', platform: 'indeed' },
  { name: 'Instacart', logo: '🟢', industry: 'Delivery', platform: 'linkedin' },
];

const MOCK_ROLES = [
  { title: 'Senior Software Engineer', skills: ['Go', 'Kubernetes', 'PostgreSQL', 'AWS'] },
  { title: 'Backend Engineer', skills: ['Node.js', 'Python', 'MySQL', 'Redis'] },
  { title: 'SDE-2', skills: ['Java', 'Spring Boot', 'Kafka', 'MongoDB'] },
  { title: 'Platform Engineer', skills: ['Go', 'Terraform', 'AWS', 'Docker'] },
  { title: 'Sr. Software Engineer', skills: ['Python', 'Django', 'PostgreSQL', 'GCP'] },
  { title: 'Full Stack Engineer', skills: ['React', 'Node.js', 'TypeScript', 'AWS'] },
  { title: 'API Engineer', skills: ['GraphQL', 'Node.js', 'Redis', 'MongoDB'] },
  { title: 'Distributed Systems Engineer', skills: ['Go', 'gRPC', 'Kafka', 'Kubernetes'] },
  { title: 'DevOps Engineer', skills: ['Kubernetes', 'Terraform', 'Ansible', 'CI/CD'] },
  { title: 'SDE-3', skills: ['Java', 'Scala', 'Spark', 'AWS'] },
];

const LOCATIONS = ['Bangalore', 'Remote', 'Hyderabad', 'Pune', 'Mumbai', 'Noida', 'Chennai'];
const JOB_TYPES = ['remote', 'hybrid', 'onsite'];
const SALARIES = ['₹20-30L', '₹30-45L', '₹40-60L', '₹50-75L', '₹60-90L', '₹80-120L'];

const getMockJobs = (count = 30) => {
  const jobs = [];
  for (let i = 0; i < count; i++) {
    const company = MOCK_COMPANIES[i % MOCK_COMPANIES.length];
    const role = MOCK_ROLES[i % MOCK_ROLES.length];
    jobs.push({
      _id: `mock_${i}_${Date.now()}`,
      title: role.title,
      company: company.name,
      companyLogo: company.logo,
      location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
      locationType: JOB_TYPES[Math.floor(Math.random() * JOB_TYPES.length)],
      salary: SALARIES[Math.floor(Math.random() * SALARIES.length)],
      platform: company.platform,
      skills: role.skills,
      description: `We are looking for a ${role.title} to join our growing engineering team at ${company.name}. You will work on building scalable systems that impact millions of users. Required skills: ${role.skills.join(', ')}. Experience: 3-7 years.`,
      postedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      industry: company.industry,
    });
  }
  return jobs;
};

const getMockStats = () => ({
  totalApplications: 247,
  appliedToday: 23,
  dailyLimit: 30,
  interviews: 8,
  offers: 2,
  profileViews: 41,
  successRate: 3.2,
  avgMatchScore: 84,
  weeklyData: [
    { day: 'Mon', applied: 28, responses: 1 },
    { day: 'Tue', applied: 30, responses: 2 },
    { day: 'Wed', applied: 25, responses: 0 },
    { day: 'Thu', applied: 30, responses: 3 },
    { day: 'Fri', applied: 29, responses: 1 },
    { day: 'Sat', applied: 20, responses: 1 },
    { day: 'Sun', applied: 23, responses: 2 },
  ],
  platformBreakdown: [
    { platform: 'LinkedIn', count: 142, responseRate: 3.8 },
    { platform: 'Indeed', count: 78, responseRate: 2.9 },
    { platform: 'Naukri', count: 27, responseRate: 1.4 },
  ],
});

module.exports = { getMockJobs, getMockStats };
