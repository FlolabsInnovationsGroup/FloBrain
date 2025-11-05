const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const logger = require('../services/logger');
const asyncLocalStorage = require('../services/request-context'); 

function requestCorrelator(req, res, next) {
  const requestIdHeader = config.requestIdHeader.toLowerCase();
  const requestId = req.get(requestIdHeader) || uuidv4();

  req.requestId = requestId;
  res.set(config.requestIdHeader, requestId);
  
  const childLogger = logger.child({ request_id: requestId });
  
  // For backward compatibility, we'll keep req.log, but new code should avoid it.
  req.log = childLogger;

  // We store the logger in the context "store".
  const store = { logger: childLogger };
  asyncLocalStorage.run(store, () => {
    next();
  });
}

module.exports = requestCorrelator;