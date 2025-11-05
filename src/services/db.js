const logger = require('./logger');
const asyncLocalStorage = require('./request-context'); // <-- NEW IMPORT

const mockDbQuery = (latencyMs) => {
  return new Promise(resolve => setTimeout(() => resolve({ success: true }), latencyMs));
};

// --- REFACTOR: Remove the 'log' parameter from the function signature ---
async function timedQuery(sqlLabel, queryFn) {
  // <-- Get the logger directly from the context!
  const store = asyncLocalStorage.getStore();
  const log = store?.logger || logger; // Fallback to base logger if not in a request

  const startTime = process.hrtime();
  const SLOW_QUERY_THRESHOLD_MS = 200;

  try {
    return await queryFn();
  } finally {
    const endTime = process.hrtime(startTime);
    const latencyMs = (endTime[0] * 1000 + endTime[1] / 1e6);

    if (latencyMs > SLOW_QUERY_THRESHOLD_MS) {
      log.info({
        sql_label: sqlLabel,
        latency_ms: parseFloat(latencyMs.toFixed(2)),
        msg: 'Slow database query detected.',
      });
    }
  }
}

module.exports = {
  mockDbQuery,
  timedQuery,
};