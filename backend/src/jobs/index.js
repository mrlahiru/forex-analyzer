import { marketScanner } from '../services/signals/marketScanner.js';

/**
 * Initialize all scheduled background jobs (Phase 8)
 */
export const initScheduledJobs = () => {
  // Start automatic background market scanner
  marketScanner.start();
};

export { marketScanner };
export default initScheduledJobs;
