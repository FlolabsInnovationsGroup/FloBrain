const onFinished = require('on-finished');

function requestLogger(req, res, next) {
  const startTime = process.hrtime();
  const route = `${req.method} ${req.originalUrl}`;

  // Log the start of the request
  req.log.info({ route, msg: 'Request started' });

  // Log the end of the request
  onFinished(res, (err, finalRes) => {
    const endTime = process.hrtime(startTime);
    const latencyMs = (endTime[0] * 1000 + endTime[1] / 1e6).toFixed(2);
    
    req.log.info({
      route,
      status: finalRes.statusCode,
      latency_ms: parseFloat(latencyMs),
      msg: 'Request finished',
    });
  });

  next();
}

module.exports = requestLogger;