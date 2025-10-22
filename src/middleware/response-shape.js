// src/middleware/response-shape.js
function success(res, data = {}, meta) {
  const body = { success: true, data };
  if (meta) body.meta = meta;
  return res.json(body);
}

function fail(res, message = 'Internal error', code = 'ERR_INTERNAL', details) {
  const body = { success: false, error: { message, code } };
  if (details) body.error.details = details;
  return res.status(500).json(body);
}

module.exports = { success, fail };
