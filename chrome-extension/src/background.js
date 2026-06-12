// chrome-extension/src/background.js
// Background service worker for Formium Hub Chrome Extension

const FORMIUM_HUB_URL = "http://localhost:3000"; // Change to production URL

/**
 * Listens for messages from the content script.
 * When a page is opened with ?fhAccountId=, the content script
 * asks us to fetch the credentials securely.
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "FETCH_CREDENTIALS") {
    fetchCredentials(message.accountId)
      .then((data) => sendResponse({ success: true, data }))
      .catch((err) => sendResponse({ success: false, error: err.message }));

    // Return true to keep the message channel open for async response
    return true;
  }
});

/**
 * Fetches decrypted credentials from the Formium Hub API.
 * Uses the user's existing browser session cookie.
 */
async function fetchCredentials(accountId) {
  const response = await fetch(
    `${FORMIUM_HUB_URL}/api/credentials/${accountId}`,
    {
      method: "GET",
      credentials: "include", // Send session cookies
      headers: {
        "Content-Type": "application/json",
        "X-Extension-Version": "1.0.0",
      },
    }
  );

  if (response.status === 401) {
    throw new Error("Not authenticated. Please log in to Formium Hub.");
  }
  if (response.status === 403) {
    throw new Error("Access denied. Admin role required.");
  }
  if (!response.ok) {
    throw new Error(`Failed to fetch credentials (${response.status})`);
  }

  const json = await response.json();
  if (!json.success) {
    throw new Error(json.error || "Unknown error");
  }

  return json.data;
}
