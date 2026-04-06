// Handles account creation and login for investor users.
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { readJson, writeJson } = require("../utils/fileDb");
const { sanitizeText, sanitizeEmail, normalizePhoneNumber } = require("../utils/sanitize");
const { jwtSecret } = require("../config/security");

function buildToken(userId) {
  return jwt.sign({ userId }, jwtSecret, { expiresIn: "7d" });
}

function publicUser(user) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    mobile: user.mobile,
    accountStatus: user.accountStatus
  };
}

async function register(req, res, next) {
  try {
    // Sanitize incoming form values before validation and storage.
    const body = {
      fullName: sanitizeText(req.body.fullName),
      email: sanitizeEmail(req.body.email),
      mobile: normalizePhoneNumber(req.body.mobile),
      password: String(req.body.password || "").trim()
    };

    const mobilePattern = /^(09|\+639)\d{9}$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!body.fullName || body.fullName.length < 2) {
      return res.status(400).json({ success: false, message: "Please enter your full name." });
    }

    if (!emailPattern.test(body.email)) {
      return res.status(400).json({ success: false, message: "Please enter a valid email address." });
    }

    if (!mobilePattern.test(body.mobile)) {
      return res.status(400).json({ success: false, message: "Please enter a valid Philippine mobile number." });
    }

    if (body.password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
    }

    const users = await readJson("users.json");
    const duplicate = users.find(user => user.email === body.email);
    if (duplicate) {
      return res.status(409).json({ success: false, message: "An account with this email already exists." });
    }

    // New user passwords are always stored as bcrypt hashes.
    const passwordHash = await bcrypt.hash(body.password, 10);
    const user = {
      id: `user_${Date.now()}`,
      fullName: body.fullName,
      email: body.email,
      mobile: body.mobile,
      passwordHash,
      accountStatus: "Active",
      createdAt: new Date().toISOString()
    };

    users.push(user);
    await writeJson("users.json", users);

    const token = buildToken(user.id);
    return res.status(201).json({
      success: true,
      message: "Registration successful.",
      token,
      user: publicUser(user)
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const email = sanitizeEmail(req.body.email);
    const password = String(req.body.password || "").trim();

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const users = await readJson("users.json");
    const user = users.find(item => item.email === email);

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid login credentials." });
    }

    // Compare the submitted password against the stored bcrypt hash.
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ success: false, message: "Invalid login credentials." });
    }

    const token = buildToken(user.id);
    return res.json({
      success: true,
      message: "Login successful.",
      token,
      user: publicUser(user)
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login
};
