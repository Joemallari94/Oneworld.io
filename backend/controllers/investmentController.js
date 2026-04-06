// Handles investment creation and dashboard-ready tracking responses.
const { readJson, writeJson } = require("../utils/fileDb");
const packages = require("../utils/packages");
const { sanitizeText } = require("../utils/sanitize");

function addMonths(dateString, months) {
  const date = new Date(dateString);
  const copy = new Date(date);
  copy.setMonth(copy.getMonth() + months);
  return copy.toISOString();
}

function enrichInvestment(investment, allInvestments) {
  // Add computed values used directly by the frontend dashboard.
  const packageConfig = packages[investment.packageId];
  const usedSlots = allInvestments.filter(item => item.packageId === investment.packageId).length;
  const totalDurationMs = new Date(investment.endDate) - new Date(investment.startDate);
  const remainingMs = Math.max(new Date(investment.endDate) - Date.now(), 0);
  const elapsedMs = Math.min(Date.now() - new Date(investment.startDate), totalDurationMs);
  const progress = totalDurationMs > 0 ? Math.max(0, Math.min(100, Math.round((elapsedMs / totalDurationMs) * 100))) : 0;
  const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));

  return {
    ...investment,
    packageName: packageConfig.name,
    maxSlots: packageConfig.maxSlots,
    slotsUsed: usedSlots,
    availableSlots: Math.max(packageConfig.maxSlots - usedSlots, 0),
    progress,
    remainingDays: Math.max(remainingDays, 0)
  };
}

async function createInvestment(req, res, next) {
  try {
    const packageId = sanitizeText(req.body.packageId).toUpperCase();
    const paymentMethod = sanitizeText(req.body.paymentMethod);
    const packageConfig = packages[packageId];

    if (!packageConfig) {
      return res.status(400).json({ success: false, message: "Please choose a valid package." });
    }

    if (!["GCash", "Cash Meet-up"].includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: "Please choose a valid payment method." });
    }

    const investments = await readJson("investments.json");
    const usedSlots = investments.filter(item => item.packageId === packageId).length;

    if (usedSlots >= packageConfig.maxSlots) {
      return res.status(400).json({ success: false, message: "This package is currently full." });
    }

    const createdAt = new Date().toISOString();
    // Each saved investment is tied to the authenticated user.
    const record = {
      id: `investment_${Date.now()}`,
      userId: req.user.id,
      packageId,
      packageSelected: packageConfig.name,
      investmentAmount: packageConfig.amount,
      estimatedReturns: packageConfig.returns,
      startDate: createdAt,
      endDate: addMonths(createdAt, packageConfig.durationMonths),
      paymentMethod,
      accountStatus: req.user.accountStatus
    };

    investments.push(record);
    await writeJson("investments.json", investments);

    return res.status(201).json({
      success: true,
      message: "Investment added successfully.",
      investment: enrichInvestment(record, investments)
    });
  } catch (error) {
    next(error);
  }
}

async function getInvestments(req, res, next) {
  try {
    const allInvestments = await readJson("investments.json");
    const userInvestments = allInvestments
      .filter(item => item.userId === req.user.id)
      .map(item => enrichInvestment(item, allInvestments))
      .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

    const summary = userInvestments.reduce(
      (accumulator, investment) => {
        accumulator.activeInvestments += 1;
        accumulator.totalAmount += investment.investmentAmount;
        accumulator.totalReturns += investment.estimatedReturns;
        return accumulator;
      },
      {
        activeInvestments: 0,
        totalAmount: 0,
        totalReturns: 0
      }
    );

    return res.json({
      success: true,
      user: {
        fullName: req.user.fullName,
        email: req.user.email,
        mobile: req.user.mobile,
        accountStatus: req.user.accountStatus
      },
      summary,
      packages: Object.values(packages),
      investments: userInvestments
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createInvestment,
  getInvestments
};
