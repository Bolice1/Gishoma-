function sanitizeInput(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const sanitized = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'string') {// must not be any other thing rather than a string 
      sanitized[k] = v
        .replace(/[<>]/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '');
    } else if (typeof v === 'object' && v !== null && !Array.isArray(v) && !(v instanceof Date)) {
      sanitized[k] = sanitizeInput(v);
    } else {
      sanitized[k] = v;
    }
  }
  return sanitized;
}

function sanitizeMiddleware(req, res, next) {
  if (req.body) req.body = sanitizeInput(req.body);
  if (req.query) req.query = sanitizeInput(req.query);
  next();
}

module.exports = { sanitizeInput, sanitizeMiddleware };
// this will help us to remove unwanted contents by flaging them 
