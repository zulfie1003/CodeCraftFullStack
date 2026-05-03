import 'dotenv/config';

const envValue = (name, fallback = '') => {
  const value = String(process.env[name] || '').trim();

  if (!value || /^your[-_]/i.test(value)) {
    return fallback;
  }

  return value;
};

const readJobList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.jobs)) return payload.jobs;
  return [];
};

const hasDirectApplyUrl = (job = {}) => {
  const applyOption = Array.isArray(job.apply_options)
    ? job.apply_options.find((option) => option?.apply_link || option?.url)
    : null;
  const values = [
    job.job_apply_link,
    job.apply_link,
    job.url,
    job.job_google_link,
    job.job_publisher_link,
    applyOption?.apply_link,
    applyOption?.url,
  ];

  return values.some((value) => {
    try {
      const url = new URL(String(value || '').trim());
      return ['http:', 'https:'].includes(url.protocol);
    } catch {
      return false;
    }
  });
};

const buildSearchQuery = () => {
  const query = envValue('RAPIDAPI_QUERY', 'software developer');
  const location = envValue('RAPIDAPI_LOCATION', 'India');

  if (!location || new RegExp(`\\b${location}\\b`, 'i').test(query)) {
    return query;
  }

  return `${query} in ${location}`;
};

const run = async () => {
  const apiKey = envValue('RAPIDAPI_KEY');
  const apiHost = envValue('RAPIDAPI_HOST', 'jsearch.p.rapidapi.com');
  const apiUrl = envValue('RAPIDAPI_JOBS_URL', 'https://jsearch.p.rapidapi.com/search-v2');

  console.log(`RAPIDAPI_KEY: ${apiKey ? `set (${apiKey.length} chars)` : 'missing'}`);
  console.log(`RAPIDAPI_HOST: ${apiHost || 'missing'}`);
  console.log(`RAPIDAPI_JOBS_URL: ${apiUrl || 'missing'}`);

  if (!apiKey) {
    throw new Error('RAPIDAPI_KEY is missing in the backend environment.');
  }

  const url = new URL(apiUrl);
  const isJSearchApi = apiHost === 'jsearch.p.rapidapi.com';

  url.searchParams.set('query', buildSearchQuery());
  url.searchParams.set('page', envValue('RAPIDAPI_PAGE', '1'));
  url.searchParams.set('num_pages', envValue('RAPIDAPI_NUM_PAGES', '1'));

  if (isJSearchApi) {
    url.searchParams.set('country', envValue('RAPIDAPI_COUNTRY', 'in'));
  } else if (envValue('RAPIDAPI_LOCATION')) {
    url.searchParams.set('location', envValue('RAPIDAPI_LOCATION'));
  }

  console.log(`Request URL: ${url}`);

  const response = await fetch(url, {
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': apiHost,
    },
  });
  const body = await response.text();

  console.log(`HTTP status: ${response.status}`);

  if (!response.ok) {
    console.log(`Response body: ${body.slice(0, 700)}`);
    throw new Error('RapidAPI request failed.');
  }

  const payload = JSON.parse(body);
  const jobs = readJobList(payload);

  console.log(`Raw jobs returned: ${jobs.length}`);
  console.log(`Jobs with direct apply/google URL: ${jobs.filter(hasDirectApplyUrl).length}`);
  console.log(`Jobs missing direct apply/google URL: ${jobs.filter((job) => !hasDirectApplyUrl(job)).length}`);

  if (jobs[0]) {
    console.log(
      `First job: ${JSON.stringify(
        {
          title: jobs[0].job_title || jobs[0].title,
          company: jobs[0].employer_name || jobs[0].company || jobs[0].company_name,
          location: jobs[0].job_location || jobs[0].location,
          applyUrl: jobs[0].job_apply_link || jobs[0].apply_link || jobs[0].job_google_link || jobs[0].apply_options?.[0]?.apply_link,
          postedAt: jobs[0].job_posted_at_datetime_utc || jobs[0].job_posted_at || jobs[0].date_posted,
        },
        null,
        2
      )}`
    );
  }
};

run().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
