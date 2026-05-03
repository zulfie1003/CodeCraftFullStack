import { syncExternalJobs } from './jobSync.service.js';

const ONE_HOUR_IN_MS = 60 * 60 * 1000;
const DEFAULT_STARTUP_SYNC_DELAY_MS = 30 * 1000;

let schedulerId;

export const startJobSyncScheduler = () => {
  if (schedulerId) {
    return schedulerId;
  }

  const scheduleEnabled = process.env.ENABLE_JOB_SYNC !== 'false';

  if (!scheduleEnabled) {
    console.log('Job sync scheduler disabled via ENABLE_JOB_SYNC=false');
    return null;
  }

  const runSync = async () => {
    try {
      const summary = await syncExternalJobs();
      console.log('Hourly job sync completed:', summary);
    } catch (error) {
      console.error('Hourly job sync failed:', error.message);
    }
  };

  if (process.env.RUN_JOB_SYNC_ON_STARTUP !== 'false') {
    const configuredDelay = Number(process.env.JOB_SYNC_STARTUP_DELAY_MS);
    const startupDelay = Number.isFinite(configuredDelay)
      ? Math.max(0, configuredDelay)
      : DEFAULT_STARTUP_SYNC_DELAY_MS;

    setTimeout(runSync, startupDelay);
    console.log(`Initial job sync scheduled in ${startupDelay}ms.`);
  }

  schedulerId = setInterval(runSync, ONE_HOUR_IN_MS);
  console.log('Job sync scheduler started. Next runs every 1 hour.');

  return schedulerId;
};
