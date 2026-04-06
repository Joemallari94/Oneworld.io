const jwt = require("jsonwebtoken");
const { readJson } = require("../utils/fileDb");
const { jwtSecret } = require("../config/security");

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, message: "Authentication required." });
    }

    const decoded = jwt.verify(token, jwtSecret);
    const users = await readJson("users.json");
    const user = users.find(item => item.id === decoded.userId);

    if (!user) {
      return res.status(401).json({ success: false, message: "User account not found." });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
}

module.exports = {
  requireAuth
};
