// chrome-extension/src/popup.js
const FORMIUM_HUB_URL = "http://localhost:3000";

const statusEl = document.getElementById("status");
const statusTextEl = document.getElementById("status-text");
const openHubEl = document.getElementById("open-hub");

openHubEl.href = FORMIUM_HUB_URL + "/dashboard";

// Check if the extension can reach Formium Hub
fetch(FORMIUM_HUB_URL + "/api/stats", { credentials: "include" })
  .then((r) => {
    if (r.status === 401) throw new Error("Not signed in");
    if (!r.ok) throw new Error("Hub unreachable");
    statusEl.className = "status active";
    statusTextEl.textContent = "Connected to Formium Hub";
  })
  .catch((err) => {
    statusEl.className = "status inactive";
    statusTextEl.textContent = err.message === "Not signed in"
      ? "Sign in to Formium Hub first"
      : "Cannot reach Formium Hub";
  });
