function sanitizeText(value = "") {
  return String(value)
    .replace(/<[^>]*>?/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizeEmail(value = "") {
  return sanitizeText(value).toLowerCase();
}

function normalizePhoneNumber(value = "") {
  return sanitizeText(value).replace(/[\s-]+/g, "");
}

module.exports = {
  sanitizeText,
  sanitizeEmail,
  normalizePhoneNumber
};
