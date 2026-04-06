const express = require("express");
const { isDevelopment } = require("../config/security");

const router = express.Router();

// Lightweight health-check route:
// - no database calls
// - no authentication
// - useful for waking sleeping backends and testing connectivity
router.get("/", (req, res) => {
  const timestamp = new Date().toISOString();

  if (isDevelopment) {
    console.log(`Health-check ping received at ${timestamp}`);
  }

  res.json({
    status: "ok",
    timestamp
  });
});

module.exports = router;
