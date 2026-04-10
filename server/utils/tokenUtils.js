const crypto = require("crypto");

/**
 * SECURITY FIX: Hash refresh tokens before storage using SHA256
 * This prevents database breaches from immediately compromising sessions
 */

const hashRefreshToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

/**
 * Verify refresh token by comparing hashes
 */
const verifyRefreshToken = (plaintextToken, hashedToken) => {
  const hash = hashRefreshToken(plaintextToken);
  return hash === hashedToken;
};

/**
 * Generate a secure random token (if needed)
 */
const generateSecureToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

module.exports = {
  hashRefreshToken,
  verifyRefreshToken,
  generateSecureToken,
};
