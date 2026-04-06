// Dashboard script for authenticated investors.
// Loads investments, renders summary cards, and saves new package entries.
const peso = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

// API base URL notes:
// - localhost automatically points to the local backend
// - deployed static hosts can inject window.API_BASE_URL later if needed
// - the fallback production URL is a placeholder for services like Render
const isLocalFrontend = ["", "localhost", "127.0.0.1"].includes(window.location.hostname);
const API_BASE_URL = isLocalFrontend
  ? "http://localhost:5000"
  : window.API_BASE_URL || "https://your-render-backend.onrender.com";

function buildApiUrl(path) {
  return `${API_BASE_URL}${path}`;
}

const token = localStorage.getItem("owiToken");
const pendingPackage = localStorage.getItem("owiPendingPackage");

if (!token) {
  window.location.href = "index.html";
}

const theme = {
  storageKey: "owiTheme",
  media: window.matchMedia("(prefers-color-scheme: dark)"),
  current() {
    return document.body.dataset.theme || "dark";
  },
  preferred() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved === "dark" || saved === "light") {
      return saved;
    }
    return this.media.matches ? "dark" : "light";
  },
  apply(mode) {
    document.body.dataset.theme = mode;
    const toggle = document.getElementById("themeToggle");
    if (toggle) {
      toggle.setAttribute("aria-pressed", String(mode === "dark"));
      toggle.setAttribute("aria-label", `Switch to ${mode === "dark" ? "light" : "dark"} mode`);
      toggle.textContent = mode === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode";
    }
  },
  save(mode) {
    localStorage.setItem(this.storageKey, mode);
    this.apply(mode);
  },
  toggle() {
    this.save(this.current() === "dark" ? "light" : "dark");
  }
};

const request = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    },
    ...options
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }
  return data;
};

// Lightweight backend ping:
// - useful for waking sleeping free-tier backends
// - helps before dashboard investment requests
async function testBackendConnection() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`);
    const data = await res.json();
    console.log("Backend connection OK:", data);
    return true;
  } catch (err) {
    console.warn("Backend connection failed:", err);
    return false;
  }
}

function showFeedback(message, type) {
  const feedback = document.getElementById("investmentFeedback");
  feedback.textContent = message;
  feedback.classList.remove("hidden", "success", "error");
  feedback.classList.add(type);
}

function setupThemeToggle() {
  const sidebar = document.querySelector(".sidebar");
  if (!sidebar || document.getElementById("themeToggle")) return;

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.id = "themeToggle";
  toggle.className = "ghost-btn theme-toggle";
  toggle.addEventListener("click", () => theme.toggle());

  const logoutButton = document.getElementById("logoutButton");
  if (logoutButton) {
    sidebar.insertBefore(toggle, logoutButton);
  } else {
    sidebar.appendChild(toggle);
  }

  theme.apply(theme.preferred());
}

function populatePackages(items) {
  // Keep package options in sync with the backend package list.
  const select = document.getElementById("packageId");
  select.innerHTML = '<option value="">Select a package</option>';
  items.forEach(item => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = `${item.id} - ${item.name} (${peso.format(item.amount)} to ${peso.format(item.returns)})`;
    select.appendChild(option);
  });

  if (pendingPackage) {
    select.value = pendingPackage;
  }
}

function renderSummary(data) {
  document.getElementById("welcomeName").textContent = `Welcome, ${data.user.fullName}`;
  document.getElementById("accountMeta").textContent = `${data.user.email} | ${data.user.mobile}`;
  document.getElementById("summaryCount").textContent = data.summary.activeInvestments;
  document.getElementById("summaryAmount").textContent = peso.format(data.summary.totalAmount);
  document.getElementById("summaryReturns").textContent = peso.format(data.summary.totalReturns);
  document.getElementById("summaryStatus").textContent = data.user.accountStatus;
}

function renderInvestments(items) {
  // Build dashboard cards from the API response.
  const container = document.getElementById("investmentCards");
  const emptyState = document.getElementById("emptyState");
  container.innerHTML = "";

  if (!items.length) {
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  items.forEach(item => {
    const card = document.createElement("article");
    card.className = "investment-item";
    card.innerHTML = `
      <h3>${item.packageSelected}</h3>
      <div class="meta-grid">
        <div class="meta-line"><span>Investment Amount</span><strong>${peso.format(item.investmentAmount)}</strong></div>
        <div class="meta-line"><span>Estimated Returns</span><strong>${peso.format(item.estimatedReturns)}</strong></div>
        <div class="meta-line"><span>Start Date</span><strong>${new Date(item.startDate).toLocaleDateString("en-PH")}</strong></div>
        <div class="meta-line"><span>End Date</span><strong>${new Date(item.endDate).toLocaleDateString("en-PH")}</strong></div>
        <div class="meta-line"><span>Slots Used</span><strong>${item.slotsUsed} / ${item.maxSlots}</strong></div>
        <div class="meta-line"><span>Payment Method</span><strong>${item.paymentMethod}</strong></div>
        <div class="meta-line"><span>Account Status</span><strong>${item.accountStatus}</strong></div>
        <div class="meta-line"><span>Time Remaining</span><strong>${item.remainingDays} days</strong></div>
      </div>
      <div class="progress-track"><span class="progress-fill" style="width:${item.progress}%"></span></div>
    `;
    container.appendChild(card);
  });
}

async function loadDashboard() {
  try {
    const backendReady = await testBackendConnection();
    if (!backendReady) {
      showFeedback("Backend is waking up or unavailable. Please try again shortly.", "error");
      return;
    }

    const data = await request(buildApiUrl("/api/investments"));
    populatePackages(data.packages);
    renderSummary(data);
    renderInvestments(data.investments);
  } catch (error) {
    if (error.message === "Invalid or expired token." || error.message === "Authentication required.") {
      localStorage.removeItem("owiToken");
      localStorage.removeItem("owiUser");
      window.location.href = "index.html";
      return;
    }

    showFeedback(error.message || "Unable to load dashboard right now.", "error");
  }
}

document.getElementById("investmentForm").addEventListener("submit", async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const payload = Object.fromEntries(new FormData(form).entries());

  try {
    const backendReady = await testBackendConnection();
    if (!backendReady) {
      showFeedback("Backend is waking up or unavailable. Please try again shortly.", "error");
      return;
    }

    const result = await request(buildApiUrl("/api/investments"), {
      method: "POST",
      body: JSON.stringify(payload)
    });
    localStorage.removeItem("owiPendingPackage");
    showFeedback(result.message, "success");
    form.reset();
    await loadDashboard();
  } catch (error) {
    showFeedback(error.message, "error");
  }
});

document.getElementById("logoutButton").addEventListener("click", () => {
  localStorage.removeItem("owiToken");
  localStorage.removeItem("owiUser");
  localStorage.removeItem("owiPendingPackage");
  window.location.href = "index.html";
});

setupThemeToggle();
loadDashboard();

theme.media.addEventListener("change", event => {
  if (!localStorage.getItem(theme.storageKey)) {
    theme.apply(event.matches ? "dark" : "light");
  }
});
