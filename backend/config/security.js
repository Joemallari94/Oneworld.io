// Central backend security configuration.
// Keep environment logic here so auth and startup behavior stay consistent.

const isDevelopment = process.env.NODE_ENV === "development";
const fallbackJwtSecret = "dev-secret-change-me";
const jwtSecret = process.env.JWT_SECRET || (isDevelopment ? fallbackJwtSecret : "");

module.exports = {
  isDevelopment,
  jwtSecret,
  fallbackJwtSecret
};
