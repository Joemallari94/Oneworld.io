const express = require("express");
const { createInvestment, getInvestments } = require("../controllers/investmentController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", requireAuth, getInvestments);
router.post("/", requireAuth, createInvestment);

module.exports = router;
