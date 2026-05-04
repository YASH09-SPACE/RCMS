const cron = require('node-cron');
const { checkProbationAndSuspend, generateMonthlySnapshots } = require('../services/performanceService');

/**
 * Performance Monitor Cron Jobs
 * 1. Every 6 hours: Check probation users and auto-suspend if 48h expired
 * 2. 1st of every month at midnight: Generate monthly performance snapshots
 */
const startPerformanceMonitor = () => {
  // Check probation every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    console.log('📊 Running Performance Probation Check...');
    await checkProbationAndSuspend();
  });

  // Monthly snapshot on 1st of month at 00:05
  cron.schedule('5 0 1 * *', async () => {
    console.log('📊 Generating Monthly Performance Snapshots...');
    await generateMonthlySnapshots();
  });

  console.log('📊 Performance Monitor initialized (probation check: every 6h, snapshots: 1st of month)');
};

module.exports = startPerformanceMonitor;
