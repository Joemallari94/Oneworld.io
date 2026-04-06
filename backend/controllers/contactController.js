const { readJson, writeJson } = require("../utils/fileDb");
const { sanitizeText, sanitizeEmail, normalizePhoneNumber } = require("../utils/sanitize");

async function submitContact(req, res, next) {
  try {
    const payload = {
      id: `contact_${Date.now()}`,
      name: sanitizeText(req.body.name),
      mobile: normalizePhoneNumber(req.body.mobile),
      email: sanitizeEmail(req.body.email),
      message: sanitizeText(req.body.message),
      createdAt: new Date().toISOString()
    };

    const mobilePattern = /^(09|\+639)\d{9}$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!payload.name || payload.name.length < 2) {
      return res.status(400).json({ success: false, message: "Please enter a valid name." });
    }

    if (!mobilePattern.test(payload.mobile)) {
      return res.status(400).json({ success: false, message: "Please enter a valid Philippine mobile number." });
    }

    if (!emailPattern.test(payload.email)) {
      return res.status(400).json({ success: false, message: "Please enter a valid email address." });
    }

    if (!payload.message || payload.message.length < 10) {
      return res.status(400).json({ success: false, message: "Please enter a longer message." });
    }

    const contacts = await readJson("contacts.json");
    contacts.push(payload);
    await writeJson("contacts.json", contacts);

    return res.json({ success: true, message: "Your inquiry was sent successfully." });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  submitContact
};
