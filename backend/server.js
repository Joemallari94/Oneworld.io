require("dotenv").config(); // makes .env variables available before process.env is used
// Express server for the One World Investment starter backend.
const path = require("path");
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const contactRoutes = require("./routes/contactRoutes");
const healthRoutes = require("./routes/health");
const investmentRoutes = require("./routes/investmentRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const { isDevelopment, jwtSecret, fallbackJwtSecret } = require("./config/security");

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = [...new Set([
  "http://localhost:3000",
  "http://localhost:5000",
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "https://your-netlify-site.netlify.app",
  process.env.FRONTEND_URL
].filter(Boolean))];

// Dynamic CORS policy:
// - allow requests with no origin header (Postman, health checks, server-to-server)
// - allow browser requests only from trusted frontend origins
// - reject unknown browser origins cleanly
const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
};

// JWT secret policy:
// - development can use a fallback secret for easier local setup
// - production-like environments must provide a real secret and will stop otherwise
if (!jwtSecret) {
  console.error("JWT_SECRET is required outside development mode. Server stopped.");
  process.exit(1);
}

if (isDevelopment && jwtSecret === fallbackJwtSecret) {
  console.warn("Running in development mode with the fallback JWT secret. Change it before deployment.");
}

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "..", "frontend")));

app.use("/api", authRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/investments", investmentRoutes);

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "dashboard.html"));
});

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }
  return res.sendFile(path.join(__dirname, "..", "frontend", "index.html"));
});

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  const mode = isDevelopment ? "development" : "production";
  console.log(`One World Investment server running on port ${PORT}`);
  console.log(`Running in ${mode} mode`);
  console.log("Allowed CORS origins:");
  allowedOrigins.forEach(origin => console.log(`- ${origin}`));
});
