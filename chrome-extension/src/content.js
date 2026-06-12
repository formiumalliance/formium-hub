// chrome-extension/src/content.js
// Content script - runs on every page, checks for fhAccountId param

(function () {
  "use strict";

  // ─── Site-specific selectors ────────────────────────────────────────────────
  // Maps hostname patterns to input selectors and optional submit button
  const SITE_CONFIGS = {
    "instagram.com": {
      username: 'input[name="username"], input[aria-label*="username" i], input[aria-label*="phone" i]',
      password: 'input[name="password"], input[aria-label*="password" i]',
      submit: 'button[type="submit"]',
      delay: 500,
    },
    "facebook.com": {
      username: '#email, input[name="email"]',
      password: '#pass, input[name="pass"]',
      submit: 'button[name="login"]',
      delay: 300,
    },
    "canva.com": {
      username: 'input[name="email"], input[type="email"]',
      password: 'input[name="password"], input[type="password"]',
      submit: 'button[type="submit"]',
      delay: 800,
    },
    "dynadot.com": {
      username: 'input[name="username"], #username',
      password: 'input[name="password"], #password',
      submit: 'input[type="submit"], button[type="submit"]',
      delay: 300,
    },
    "wordpress": {
      username: '#user_login, input[name="log"]',
      password: '#user_pass, input[name="pwd"]',
      submit: '#wp-submit',
      delay: 300,
    },
    "cpanel": {
      username: '#user, input[name="user"]',
      password: '#pass, input[name="pass"]',
      submit: '#login_btn, button[type="submit"]',
      delay: 300,
    },
  };

  // ─── Main logic ─────────────────────────────────────────────────────────────
  const params = new URLSearchParams(window.location.search);
  const accountId = params.get("fhAccountId");

  if (!accountId) return; // Not launched from Formium Hub

  console.log("[Formium Hub] Account ID detected:", accountId);

  // Find the matching config for this site
  const hostname = window.location.hostname.replace("www.", "");
  let config = null;

  for (const [pattern, cfg] of Object.entries(SITE_CONFIGS)) {
    if (hostname.includes(pattern)) {
      config = cfg;
      break;
    }
  }

  if (!config) {
    // Fallback: try generic selectors
    config = {
      username: 'input[type="email"], input[type="text"][name*="user" i], input[type="text"][name*="email" i]',
      password: 'input[type="password"]',
      submit: 'button[type="submit"]',
      delay: 500,
    };
  }

  // Request credentials from background service worker
  chrome.runtime.sendMessage(
    { type: "FETCH_CREDENTIALS", accountId },
    (response) => {
      if (chrome.runtime.lastError) {
        console.error("[Formium Hub] Extension error:", chrome.runtime.lastError);
        return;
      }
      if (!response.success) {
        console.error("[Formium Hub] Failed:", response.error);
        showNotification(response.error, "error");
        return;
      }

      const { username, password } = response.data;
      setTimeout(() => fillForm(username, password, config), config.delay);
    }
  );

  // ─── Form filling ────────────────────────────────────────────────────────────
  function fillForm(username, password, config) {
    let filled = 0;

    if (username) {
      const usernameInput = document.querySelector(config.username);
      if (usernameInput) {
        fillInput(usernameInput, username);
        filled++;
      }
    }

    if (password) {
      const passwordInput = document.querySelector(config.password);
      if (passwordInput) {
        fillInput(passwordInput, password);
        filled++;
      }
    }

    if (filled === 0) {
      console.warn("[Formium Hub] No form inputs found on this page.");
      showNotification("Could not find login form inputs.", "warning");
      return;
    }

    showNotification("Credentials filled by Formium Hub", "success");
    console.log(`[Formium Hub] Filled ${filled} field(s).`);

    // Auto-submit is optional and off by default for security
    // Uncomment to enable auto-submit:
    // if (config.submit) {
    //   const submitBtn = document.querySelector(config.submit);
    //   if (submitBtn) { setTimeout(() => submitBtn.click(), 300); }
    // }
  }

  /**
   * Fills an input while triggering React/Vue change events.
   */
  function fillInput(input, value) {
    // Trigger native input value setter (for React controlled inputs)
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value"
    )?.set;

    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(input, value);
    } else {
      input.value = value;
    }

    // Dispatch events to notify frameworks
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    input.dispatchEvent(new Event("blur", { bubbles: true }));
  }

  // ─── Toast notification ───────────────────────────────────────────────────────
  function showNotification(message, type = "info") {
    const existing = document.getElementById("fh-notification");
    if (existing) existing.remove();

    const colors = {
      success: { bg: "#10b981", border: "#059669" },
      error: { bg: "#ef4444", border: "#dc2626" },
      warning: { bg: "#f59e0b", border: "#d97706" },
      info: { bg: "#3b82f6", border: "#2563eb" },
    };

    const color = colors[type] || colors.info;

    const el = document.createElement("div");
    el.id = "fh-notification";
    el.style.cssText = `
      position: fixed;
      top: 16px;
      right: 16px;
      z-index: 2147483647;
      padding: 10px 16px;
      background: ${color.bg};
      border: 1px solid ${color.border};
      border-radius: 8px;
      color: white;
      font-size: 13px;
      font-family: -apple-system, sans-serif;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      gap: 8px;
      max-width: 320px;
    `;
    el.textContent = `⚡ Formium Hub: ${message}`;
    document.body.appendChild(el);

    setTimeout(() => el.remove(), 4000);
  }
})();
