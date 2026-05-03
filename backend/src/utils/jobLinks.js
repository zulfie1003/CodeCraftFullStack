import { isValidHttpUrl } from './jobMatching.js';

const pickUrl = (...values) =>
  values.find((value) => isValidHttpUrl(String(value || '').trim())) || '';

export const isCareerPortalLink = (url = '') => {
  try {
    const target = new URL(String(url || '').trim());
    const host = target.hostname.toLowerCase();
    const path = target.pathname.toLowerCase().replace(/\/+$/, '');

    return (
      host.startsWith('careers.') ||
      host.startsWith('jobs.') ||
      /(?:^|\/)(careers?|jobs)(?:\/|$)/i.test(path)
    );
  } catch {
    return false;
  }
};

export const extractApplyUrl = (job = {}) => {
  const applyOptions = Array.isArray(job.apply_options) ? job.apply_options : [];
  const optionUrls = applyOptions.flatMap((option = {}) => [
    option.apply_link,
    option.url,
    option.link,
  ]);

  return pickUrl(
    job.applyUrl,
    job.job_apply_link,
    job.apply_link,
    ...optionUrls,
    job.job_google_link,
    job.redirect_url,
    job.url,
    job.job_publisher_link
  );
};
