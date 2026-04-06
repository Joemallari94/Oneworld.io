const fs = require("fs").promises;
const path = require("path");

// JSON storage is for demo/development only and not recommended for production.
// This helper keeps file access centralized so migrating to MongoDB or PostgreSQL later is easier.

async function ensureFile(filePath) {
  try {
    await fs.access(filePath);
  } catch (error) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, "[]", "utf8");
  }
}

async function readJson(fileName) {
  const filePath = path.join(__dirname, "..", "data", fileName);
  await ensureFile(filePath);
  const content = await fs.readFile(filePath, "utf8");
  return JSON.parse(content || "[]");
}

async function writeJson(fileName, data) {
  const filePath = path.join(__dirname, "..", "data", fileName);
  await ensureFile(filePath);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

module.exports = {
  readJson,
  writeJson
};
