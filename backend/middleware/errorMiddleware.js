function notFound(req, res) {
  res.status(404).json({ success: false, message: "Route not found." });
}

function errorHandler(error, req, res, next) {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    success: false,
    message: error.message || "Something went wrong."
  });
}

module.exports = {
  notFound,
  errorHandler
};
