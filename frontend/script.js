// Main landing-page script:
// - calculator
// - auth forms
// - contact form
// - package selection
//
// API base URL notes:
// - localhost automatically points to the local backend
// - deployed static hosts can inject window.API_BASE_URL later if needed
// - the fallback production URL is a placeholder for services like Render
const peso = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

const isLocalFrontend = ["", "localhost", "127.0.0.1"].includes(window.location.hostname);
const API_BASE_URL = isLocalFrontend
  ? "http://localhost:5000"
  : window.API_BASE_URL || "https://your-render-backend.onrender.com";

function buildApiUrl(path) {
  return `${API_BASE_URL}${path}`;
}

function normalizePhoneNumber(value = "") {
  return String(value)
    .trim()
    .replace(/[\s-]+/g, "");
}

function isValidPhilippineMobile(value = "") {
  const normalized = normalizePhoneNumber(value);
  return /^(09\d{9}|\+639\d{9})$/.test(normalized);
}

const api = {
  async request(url, options = {}) {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      ...options
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Request failed.");
    }
    return data;
  }
};

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
      toggle.textContent = mode === "dark" ? "Light" : "Dark";
      toggle.title = `Switch to ${mode === "dark" ? "light" : "dark"} mode`;
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

// Lightweight backend ping:
// - useful for waking sleeping free-tier backends
// - helps us warn early before login/register/contact requests
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

const auth = {
  save(token, user) {
    localStorage.setItem("owiToken", token);
    localStorage.setItem("owiUser", JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem("owiToken");
    localStorage.removeItem("owiUser");
    localStorage.removeItem("owiPendingPackage");
  },
  token() {
    return localStorage.getItem("owiToken");
  },
  user() {
    const value = localStorage.getItem("owiUser");
    return value ? JSON.parse(value) : null;
  }
};

function setFeedback(element, message, type) {
  if (!element) return;
  element.textContent = message;
  element.classList.remove("hidden", "success", "error");
  element.classList.add(type);
}

function clearFeedback(element) {
  if (!element) return;
  element.textContent = "";
  element.classList.add("hidden");
  element.classList.remove("success", "error");
}

function setupActiveNavigation() {
  const sectionIds = ["home", "trust", "sectors", "packages", "calculator", "proof", "faq", "contact"];
  const links = sectionIds
    .map(id => ({ id, link: document.querySelector(`.nav a[href="#${id}"]`) }))
    .filter(item => item.link);

  if (!links.length) return;

  const sectionObserver = new IntersectionObserver(
    entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];

      if (!visible) return;

      links.forEach(item => {
        item.link.classList.toggle("active", item.id === visible.target.id);
      });
    },
    {
      threshold: [0.25, 0.5, 0.7],
      rootMargin: "-25% 0px -45% 0px"
    }
  );

  sectionIds.forEach(id => {
    const section = document.getElementById(id);
    if (section) sectionObserver.observe(section);
  });
}

function setNavState() {
  // Toggle navigation actions based on whether the visitor is logged in.
  const user = auth.user();
  document.getElementById("dashboardLink")?.classList.toggle("hidden", !user);
  document.getElementById("logoutButton")?.classList.toggle("hidden", !user);
  document.getElementById("loginTrigger")?.classList.toggle("hidden", !!user);
  document.getElementById("registerTrigger")?.classList.toggle("hidden", !!user);

  const authStatus = document.getElementById("authStatus");
  if (user && authStatus) {
    authStatus.textContent = `Logged in as ${user.fullName}. You can continue to your dashboard or invest from a package card.`;
    authStatus.classList.remove("hidden");
  }
}

function setupThemeToggle() {
  const navActions = document.querySelector(".nav-actions");
  if (!navActions || document.getElementById("themeToggle")) return;

  const themeToggle = document.createElement("button");
  themeToggle.type = "button";
  themeToggle.id = "themeToggle";
  themeToggle.className = "theme-toggle";
  themeToggle.addEventListener("click", () => theme.toggle());

  const menuToggleButton = document.getElementById("menuToggle");
  if (menuToggleButton) {
    navActions.insertBefore(themeToggle, menuToggleButton);
  } else {
    navActions.appendChild(themeToggle);
  }

  theme.apply(theme.preferred());
}

const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");
if (menuToggle && navMenu) {
  menuToggle.addEventListener("click", () => navMenu.classList.toggle("open"));
}

const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 }
);

document.querySelectorAll(".reveal").forEach(item => revealObserver.observe(item));

const counterObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const counter = entry.target;
      const target = Number(counter.dataset.target || 0);
      let current = 0;
      const step = Math.max(1, Math.ceil(target / 40));

      const tick = () => {
        current += step;
        counter.textContent = current >= target ? target : current;
        if (current < target) requestAnimationFrame(tick);
      };

      tick();
      counterObserver.unobserve(counter);
    });
  },
  { threshold: 0.5 }
);

document.querySelectorAll(".counter").forEach(counter => counterObserver.observe(counter));

const amountInput = document.getElementById("investmentAmount");
const durationInput = document.getElementById("investmentDuration");
const durationValue = document.getElementById("durationValue");
const estimatedReturn = document.getElementById("estimatedReturn");
const estimatedProfit = document.getElementById("estimatedProfit");
const monthlyProjection = document.getElementById("monthlyProjection");
const monthlyRate = 0.095;

function updateCalculator() {
  if (!amountInput || !durationInput) return;
  const amount = Number(amountInput.value) || 0;
  const duration = Number(durationInput.value) || 1;
  const totalReturn = Math.round(amount * (1 + monthlyRate * duration));
  const profit = totalReturn - amount;
  const monthly = Math.round(totalReturn / duration);

  durationValue.textContent = duration;
  estimatedReturn.textContent = peso.format(totalReturn);
  estimatedProfit.textContent = peso.format(profit);
  monthlyProjection.textContent = `${peso.format(monthly)} / month`;
}

[amountInput, durationInput].forEach(input => input?.addEventListener("input", updateCalculator));
updateCalculator();

function updatePackageSlots() {
  // Frontend-only slot preview for the landing-page cards.
  document.querySelectorAll(".package-card").forEach(card => {
    const label = card.querySelector(".slots-label");
    const fill = card.querySelector(".progress-fill");
    const total = Number(card.dataset.slots || 10);
    const randomRemaining = Math.max(total - Math.floor(Math.random() * 4), 4);
    label.textContent = `Slots Available: ${randomRemaining}`;
    fill.style.width = `${(randomRemaining / total) * 100}%`;
  });
}

updatePackageSlots();

document.querySelectorAll(".invest-btn").forEach(button => {
  button.addEventListener("click", () => {
    const card = button.closest(".package-card");
    const packageId = card?.dataset.package;
    const amount = Number(card?.dataset.amount || 0);
    const duration = Number(card?.dataset.duration || 5);

    if (amountInput) amountInput.value = amount;
    if (durationInput) durationInput.value = duration;
    updateCalculator();

    localStorage.setItem("owiPendingPackage", packageId);
    if (auth.token()) {
      window.location.href = "dashboard.html";
      return;
    }

    document.getElementById("registerModal")?.classList.add("active");
  });
});

const testimonials = Array.from(document.querySelectorAll(".testimonial"));
let testimonialIndex = 0;
function showTestimonial(index) {
  testimonials.forEach((item, currentIndex) => {
    item.classList.toggle("active", currentIndex === index);
  });
}
function moveTestimonial(direction) {
  testimonialIndex = (testimonialIndex + direction + testimonials.length) % testimonials.length;
  showTestimonial(testimonialIndex);
}
document.getElementById("prevTestimonial")?.addEventListener("click", () => moveTestimonial(-1));
document.getElementById("nextTestimonial")?.addEventListener("click", () => moveTestimonial(1));
if (testimonials.length > 1) setInterval(() => moveTestimonial(1), 5000);

document.querySelectorAll(".modal-trigger").forEach(trigger => {
  trigger.addEventListener("click", () => {
    const modalId = trigger.dataset.modal;
    document.getElementById(modalId)?.classList.add("active");
  });
});

document.querySelectorAll("[data-close-modal]").forEach(button => {
  button.addEventListener("click", () => button.closest(".modal")?.classList.remove("active"));
});

document.querySelectorAll(".modal").forEach(modal => {
  modal.addEventListener("click", event => {
    if (event.target === modal) modal.classList.remove("active");
  });
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    document.querySelectorAll(".modal").forEach(modal => modal.classList.remove("active"));
  }
});

document.getElementById("logoutButton")?.addEventListener("click", () => {
  auth.clear();
  window.location.href = "index.html";
});

document.getElementById("contactForm")?.addEventListener("submit", async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const feedback = document.getElementById("contactFeedback");
  clearFeedback(feedback);

  const payload = Object.fromEntries(new FormData(form).entries());
  payload.mobile = normalizePhoneNumber(payload.mobile);

  if (!isValidPhilippineMobile(payload.mobile)) {
    setFeedback(
      feedback,
      "Please enter a valid Philippine mobile number. Spaces and dashes are allowed.",
      "error"
    );
    return;
  }

  try {
    const backendReady = await testBackendConnection();
    if (!backendReady) {
      setFeedback(feedback, "Backend is waking up or unavailable. Please try again shortly.", "error");
      return;
    }

    const result = await api.request(buildApiUrl("/api/contact"), {
      method: "POST",
      body: JSON.stringify(payload)
    });
    form.reset();
    setFeedback(feedback, result.message, "success");
  } catch (error) {
    setFeedback(feedback, error.message, "error");
  }
});

document.getElementById("registerForm")?.addEventListener("submit", async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const feedback = document.getElementById("registerFeedback");
  clearFeedback(feedback);

  const payload = Object.fromEntries(new FormData(form).entries());
  payload.mobile = normalizePhoneNumber(payload.mobile);

  if (!isValidPhilippineMobile(payload.mobile)) {
    setFeedback(
      feedback,
      "Please enter a valid Philippine mobile number. Spaces and dashes are allowed.",
      "error"
    );
    return;
  }

  try {
    const backendReady = await testBackendConnection();
    if (!backendReady) {
      setFeedback(feedback, "Backend is waking up or unavailable. Please try again shortly.", "error");
      return;
    }

    const result = await api.request(buildApiUrl("/api/register"), {
      method: "POST",
      body: JSON.stringify(payload)
    });
    auth.save(result.token, result.user);
    setFeedback(feedback, result.message, "success");
    setNavState();
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 700);
  } catch (error) {
    setFeedback(feedback, error.message, "error");
  }
});

document.getElementById("loginForm")?.addEventListener("submit", async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const feedback = document.getElementById("loginFeedback");
  clearFeedback(feedback);

  const payload = Object.fromEntries(new FormData(form).entries());

  try {
    const backendReady = await testBackendConnection();
    if (!backendReady) {
      setFeedback(feedback, "Backend is waking up or unavailable. Please try again shortly.", "error");
      return;
    }

    const result = await api.request(buildApiUrl("/api/login"), {
      method: "POST",
      body: JSON.stringify(payload)
    });
    auth.save(result.token, result.user);
    setFeedback(feedback, result.message, "success");
    setNavState();
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 700);
  } catch (error) {
    setFeedback(feedback, error.message, "error");
  }
});

setupThemeToggle();
setupActiveNavigation();
setNavState();
testBackendConnection();

theme.media.addEventListener("change", event => {
  if (!localStorage.getItem(theme.storageKey)) {
    theme.apply(event.matches ? "dark" : "light");
  }
});
