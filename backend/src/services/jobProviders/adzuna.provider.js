import {
  extractSkillsFromText,
  normalizeExperienceText,
  normalizeJobDescription,
} from '../../utils/jobMatching.js';
import { extractApplyUrl, isCareerPortalLink } from '../../utils/jobLinks.js';

const parseRemote = (job = {}) =>
  /remote|work from home|hybrid/i.test(
    [job.title, job.description, job.location?.display_name].filter(Boolean).join(' ')
  );

const mapAdzunaType = (contractTime = '') => {
  const normalizedValue = String(contractTime || '').toLowerCase();

  if (normalizedValue.includes('part')) return 'parttime';
  if (normalizedValue.includes('contract')) return 'contract';
  return 'fulltime';
};

const mapAdzunaSalary = (job = {}) => {
  if (!job.salary_min && !job.salary_max) {
    return '';
  }

  const range = [job.salary_min, job.salary_max].filter(Boolean).join(' - ');
  return `INR ${range}`.trim();
};

const extractAdzunaRequirements = (job = {}) =>
  [job.category?.label, job.contract_time, job.contract_type]
    .map((item) => String(item || '').trim())
    .filter(Boolean);

const parseAdzunaPostedAt = (job = {}) => {
  const date = new Date(job.created);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const mapAdzunaJob = (job = {}) => {
  const applyUrl = extractApplyUrl(job);
  const title = String(job.title || '').trim();
  const company = String(job.company?.display_name || 'Unknown Company').trim();
  const description =
    normalizeJobDescription(job.description) ||
    normalizeJobDescription(`${title || 'Job'} at ${company || 'Unknown Company'}`);

  return {
    title,
    company,
    location: String(job.location?.display_name || 'Remote').trim(),
    description,
    skills: extractSkillsFromText([job.title, job.description].filter(Boolean).join(' ')),
    experience: normalizeExperienceText('Not specified'),
    applyUrl,
    isDirectCompanyApply: isCareerPortalLink(applyUrl),
    source: 'adzuna',
    sourceJobId: String(job.id || '').trim(),
    remote: parseRemote(job),
    type: /intern/i.test(job.title || '') ? 'internship' : mapAdzunaType(job.contract_time),
    requirements: extractAdzunaRequirements(job),
    salaryText: mapAdzunaSalary(job),
    postedAt: parseAdzunaPostedAt(job),
    status: 'active',
    lastSyncedAt: new Date(),
  };
};

export const fetchAdzunaJobs = async () => {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    return [];
  }

  const country = process.env.ADZUNA_COUNTRY || 'in';
  const what = process.env.ADZUNA_WHAT || 'software developer';
  const where = process.env.ADZUNA_WHERE || 'India';
  const resultsPerPage = process.env.ADZUNA_RESULTS_PER_PAGE || '20';

  const url = new URL(`https://api.adzuna.com/v1/api/jobs/${country}/search/1`);
  url.searchParams.set('app_id', appId);
  url.searchParams.set('app_key', appKey);
  url.searchParams.set('results_per_page', resultsPerPage);
  url.searchParams.set('what', what);
  url.searchParams.set('where', where);
  url.searchParams.set('content-type', 'application/json');

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Adzuna request failed with status ${response.status}`);
  }

  const payload = await response.json();
  const jobs = Array.isArray(payload?.results) ? payload.results : [];

  return jobs
    .map(mapAdzunaJob)
    .filter((job) => job.title && job.company);
};
