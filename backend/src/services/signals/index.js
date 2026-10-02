export * from './scoringEngine.js';
export * from './multiTimeframeFilter.js';
export * from './signalService.js';
export * from './marketScanner.js';
export * from './signalVerificationService.js';

import signalService from './signalService.js';
import marketScanner from './marketScanner.js';
import signalVerificationService from './signalVerificationService.js';

export { signalService, marketScanner, signalVerificationService };
export default signalService;
