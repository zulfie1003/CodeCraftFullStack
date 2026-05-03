import {
  extractSkillsFromText,
  normalizeExperienceText,
  normalizeJobDescription,
} from '../../utils/jobMatching.js';
import { extractApplyUrl, isCareerPortalLink } from '../../utils/jobLinks.js';

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
const envValue = (name, fallback = '') => {
  const value = String(process.env[name] || '').trim();

  if (!value || /^your[-_]/i.test(value)) {
    return fallback;
  }

  return value;
};

const buildSearchQuery = () => {
  const query = envValue('RAPIDAPI_QUERY', 'software developer');
  const location = envValue('RAPIDAPI_LOCATION', 'India');

  if (!location || new RegExp(`\\b${location}\\b`, 'i').test(query)) {
    return query;
  }

  return `${query} in ${location}`;
};

const getLocation = (job = {}) =>
  pickValue(
    job.job_location,
    job.location,
    [job.job_city, job.job_state, job.job_country].filter(Boolean).join(', ')
  );

const getExperienceLevel = (job = {}) => {
  const text = [
    job.job_title,
    job.job_description,
    job.job_required_experience?.required_experience_in_months,
    job.job_required_experience?.experience_mentioned,
  ]
    .filter(Boolean)
    .join(' ');
  const months = Number(job.job_required_experience?.required_experience_in_months);

  if (Number.isFinite(months) && months > 0) {
    if (months <= 12) return 'fresher';
    if (months <= 36) return 'junior';
    if (months <= 60) return 'mid';
    return 'senior';
  }

  if (/fresher|fresh graduate|entry[-\s]?level|no experience|intern/i.test(text)) {
    return 'fresher';
  }

  if (/senior|lead|principal|5\+?\s*years|[6-9]\+?\s*years|\d{2,}\+?\s*years/i.test(text)) {
    return 'senior';
  }

  if (/mid|3\+?\s*years|4\+?\s*years/i.test(text)) {
    return 'mid';
  }

  if (/junior|1\+?\s*years|2\+?\s*years/i.test(text)) {
    return 'junior';
  }

  return undefined;
};

const getJobType = (job = {}) => {
  const employmentText = pickValue(job.job_employment_type, job.job_title, job.title) || '';

  if (/intern/i.test(employmentText)) return 'internship';
  if (/part[-\s]?time/i.test(employmentText)) return 'parttime';
  if (/contract|contractor/i.test(employmentText)) return 'contract';
  return 'fulltime';
};

const getSalaryText = (job = {}) => {
  if (job.job_salary) {
    return String(job.job_salary).trim();
  }

  const minSalary = job.job_min_salary;
  const maxSalary = job.job_max_salary;

  if (!minSalary && !maxSalary) {
    return '';
  }

  const currency = job.job_salary_currency || '';
  const period = job.job_salary_period ? `/${job.job_salary_period}` : '';
  const range = [minSalary, maxSalary].filter(Boolean).join(' - ');

  return [currency, range].filter(Boolean).join(' ') + period;
};

const getRequirements = (job = {}) => {
  const highlights = job.job_highlights || {};

  return [
    ...(Array.isArray(highlights.Qualifications) ? highlights.Qualifications : []),
    ...(Array.isArray(highlights.Responsibilities) ? highlights.Responsibilities : []),
    ...(Array.isArray(job.job_required_skills) ? job.job_required_skills : []),
  ]
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .slice(0, 20);
};

const parsePostedAt = (job = {}) => {
  const rawDate = pickValue(
    job.job_posted_at_datetime_utc,
    job.job_posted_at_datetime,
    job.job_posted_at,
    job.posted_at,
    job.date_posted
  );
  const timestamp = Number(job.job_posted_at_timestamp || job.posted_at_timestamp);

  if (Number.isFinite(timestamp) && timestamp > 0) {
    const timestampMs = timestamp < 10000000000 ? timestamp * 1000 : timestamp;
    const date = new Date(timestampMs);

    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  if (rawDate) {
    const date = new Date(rawDate);

    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  return undefined;
};

const mapRapidApiJob = (job = {}) => {
  const title = pickValue(job.job_title, job.title);
  const company = String(
    pickValue(job.employer_name, job.company, job.company_name) || 'Unknown Company'
  ).trim();
  const description = pickValue(job.job_description, job.description, job.summary);
  const normalizedDescription =
    normalizeJobDescription(description || '') ||
    normalizeJobDescription(`${title || 'Job'} at ${company || 'Unknown Company'}`);
  const remoteText = [title, description, getLocation(job)].filter(Boolean).join(' ');
  const requiredSkills = Array.isArray(job.job_required_skills)
    ? job.job_required_skills
    : [];

  const applyUrl = extractApplyUrl(job);

  return {
    title: String(title || '').trim(),
    company,
    location: String(getLocation(job) || 'Remote').trim(),
    description: normalizedDescription,
    skills: extractSkillsFromText(
      [title, description, ...requiredSkills].filter(Boolean).join(' ')
    ),
    experience: normalizeExperienceText(
      pickValue(
        job.job_required_experience?.required_experience_in_months
          ? `${Math.round(job.job_required_experience.required_experience_in_months / 12)}+ years`
          : '',
        job.experience
      )
    ),
    applyUrl,
    isDirectCompanyApply: isCareerPortalLink(applyUrl),
    source: 'rapidapi',
    sourceJobId: String(pickValue(job.job_id, job.id) || '').trim(),
    remote: job.job_is_remote === true || /remote|work from home|hybrid/i.test(remoteText),
    type: getJobType(job),
    experienceLevel: getExperienceLevel(job),
    requirements: getRequirements(job),
    salaryText: getSalaryText(job),
    postedAt: parsePostedAt(job),
    status: 'active',
    lastSyncedAt: new Date(),
  };
};

const readErrorBody = async (response) => {
  const body = await response.text().catch(() => '');
  const normalizedBody = body.replace(/\s+/g, ' ').trim();

  if (!normalizedBody) {
    return '';
  }

  return `: ${normalizedBody.slice(0, 300)}`;
};

export const fetchRapidApiJobs = async () => {
  const apiKey = envValue('RAPIDAPI_KEY');
  const apiHost = envValue('RAPIDAPI_HOST', 'jsearch.p.rapidapi.com');
  const apiUrl = envValue('RAPIDAPI_JOBS_URL', 'https://jsearch.p.rapidapi.com/search-v2');

  if (!apiKey) {
    throw new Error('RapidAPI key is missing. Set RAPIDAPI_KEY in the backend environment variables and restart/redeploy the backend.');
  }

  if (!apiHost || !apiUrl) {
    throw new Error('RapidAPI host or jobs URL is missing. Set RAPIDAPI_HOST and RAPIDAPI_JOBS_URL in the backend environment variables.');
  }

  const url = new URL(apiUrl);
  const isJSearchApi = apiHost === 'jsearch.p.rapidapi.com';

  url.searchParams.set('query', buildSearchQuery());

  if (!isJSearchApi && envValue('RAPIDAPI_LOCATION')) {
    url.searchParams.set('location', envValue('RAPIDAPI_LOCATION'));
  }

  url.searchParams.set('page', envValue('RAPIDAPI_PAGE', '1'));
  url.searchParams.set('num_pages', envValue('RAPIDAPI_NUM_PAGES', '1'));

  if (isJSearchApi) {
    url.searchParams.set('country', envValue('RAPIDAPI_COUNTRY', 'in'));
  }

  const response = await fetch(url, {
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': apiHost,
    },
  });

  if (!response.ok) {
    throw new Error(
      `RapidAPI request failed with status ${response.status}${await readErrorBody(response)}`
    );
  }

  const payload = await response.json();
  const jobs = readRapidApiJobList(payload);
  const mappedJobs = jobs.map(mapRapidApiJob);
  const droppedSummary = mappedJobs.reduce(
    (summary, job) => ({
      missingTitle: summary.missingTitle + (job.title ? 0 : 1),
      missingCompany: summary.missingCompany + (job.company ? 0 : 1),
      missingLocation: summary.missingLocation + (job.location ? 0 : 1),
      missingApplyUrl: summary.missingApplyUrl + (job.applyUrl ? 0 : 1),
    }),
    {
      missingTitle: 0,
      missingCompany: 0,
      missingLocation: 0,
      missingApplyUrl: 0,
    }
  );
  const validJobs = mappedJobs.filter((job) => job.title && job.company);

  if (jobs.length > 0) {
    console.log('RapidAPI jobs mapped:', {
      raw: jobs.length,
      valid: validJobs.length,
      dropped: jobs.length - validJobs.length,
      ...droppedSummary,
    });
  }

  if (jobs.length > 0 && validJobs.length === 0) {
    throw new Error(
      `RapidAPI returned ${jobs.length} job(s), but none had all required fields after mapping. Dropped summary: ${JSON.stringify(droppedSummary)}.`
    );
  }

  return validJobs;
};
