const mongoSanitize = require("express-mongo-sanitize");

function sanitizeValue(target, options = {}) {
  if (!target || typeof target !== "object") {
    return target;
  }

  return mongoSanitize.sanitize(target, options);
}

function sanitizeRequest(options = {}) {
  return (req, res, next) => {
    ["body", "params", "headers"].forEach((key) => {
      sanitizeValue(req[key], options);
    });

    sanitizeValue(req.query, options);

    next();
  };
}

module.exports = sanitizeRequest;
