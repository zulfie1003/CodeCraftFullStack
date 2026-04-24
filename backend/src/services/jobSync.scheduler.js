import { syncExternalJobs } from './jobSync.service.js';

const ONE_HOUR_IN_MS = 60 * 60 * 1000;

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
    runSync();
  }

  schedulerId = setInterval(runSync, ONE_HOUR_IN_MS);
  console.log('Job sync scheduler started. Next runs every 1 hour.');

  return schedulerId;
};
