import {
  extractSkillsFromText,
  normalizeExperienceText,
  normalizeJobDescription,
} from '../../utils/jobMatching.js';

const readRapidApiJobList = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.jobs)) {
    return payload.jobs;
  }

  return [];
};

const pickValue = (...values) => values.find((value) => String(value || '').trim());

const mapRapidApiJob = (job = {}) => ({
  title: String(pickValue(job.job_title, job.title) || '').trim(),
  company: String(
    pickValue(job.employer_name, job.company, job.company_name) || 'Unknown Company'
  ).trim(),
  location: String(
    pickValue(job.job_city && job.job_country ? `${job.job_city}, ${job.job_country}` : '', job.location)
      || 'Remote'
  ).trim(),
  description: normalizeJobDescription(
    pickValue(job.job_description, job.description, job.summary) || ''
  ),
  skills: extractSkillsFromText(
    [
      pickValue(job.job_title, job.title),
      pickValue(job.job_description, job.description, job.summary),
      ...(Array.isArray(job.job_required_skills) ? job.job_required_skills : []),
    ]
      .filter(Boolean)
      .join(' ')
  ),
  experience: normalizeExperienceText(pickValue(job.job_required_experience?.required_experience_in_months ? `${Math.round(job.job_required_experience.required_experience_in_months / 12)}+ years` : '', job.experience)),
  applyUrl: pickValue(job.job_apply_link, job.apply_link, job.url),
  source: 'rapidapi',
  sourceJobId: String(pickValue(job.job_id, job.id) || '').trim(),
  remote: /remote|work from home|hybrid/i.test(
    [job.job_title, job.job_description, job.location].filter(Boolean).join(' ')
  ),
  type: /intern/i.test(pickValue(job.job_title, job.title) || '') ? 'internship' : 'fulltime',
  status: 'active',
  lastSyncedAt: new Date(),
});

export const fetchRapidApiJobs = async () => {
  const apiKey = process.env.RAPIDAPI_KEY;
  const apiHost = process.env.RAPIDAPI_HOST;
  const apiUrl = process.env.RAPIDAPI_JOBS_URL;

  if (!apiKey || !apiHost || !apiUrl) {
    return [];
  }

  const url = new URL(apiUrl);

  if (process.env.RAPIDAPI_QUERY) {
    url.searchParams.set('query', process.env.RAPIDAPI_QUERY);
  }

  if (process.env.RAPIDAPI_LOCATION) {
    url.searchParams.set('location', process.env.RAPIDAPI_LOCATION);
  }

  if (process.env.RAPIDAPI_PAGE) {
    url.searchParams.set('page', process.env.RAPIDAPI_PAGE);
  }

  const response = await fetch(url, {
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': apiHost,
    },
  });

  if (!response.ok) {
    throw new Error(`RapidAPI request failed with status ${response.status}`);
  }

  const payload = await response.json();
  const jobs = readRapidApiJobList(payload);

  return jobs
    .map(mapRapidApiJob)
    .filter((job) => job.title && job.company && job.location && job.applyUrl);
};
