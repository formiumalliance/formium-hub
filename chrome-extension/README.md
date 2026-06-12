# Formium Hub — Chrome Extension

Manifest V3 extension that auto-fills login credentials on supported websites when launched from Formium Hub.

## Install (Developer Mode)

1. Go to `chrome://extensions`
2. Toggle **Developer mode** on (top-right)
3. Click **Load unpacked**
4. Select this `chrome-extension/` folder

## Configuration

Before loading, update the Formium Hub URL in two files if you're not running locally on port 3000:

- `src/background.js` → `FORMIUM_HUB_URL`
- `src/popup.js` → `FORMIUM_HUB_URL`

Also add your production domain to `host_permissions` in `manifest.json`:

```json
"host_permissions": [
  "https://*/*",
  "https://hub.yourcompany.com/*"
]
```

## How It Works

1. From Formium Hub, click **Open** on a card → opens `https://site.com?fhAccountId=<id>`
2. `content.js` detects the `fhAccountId` query param
3. It messages `background.js`, which calls `GET /api/credentials/:id` on Formium Hub (using your existing session cookie)
4. If you're an **Admin**, the API returns the decrypted username/password
5. `content.js` fills the matching input fields on the page

## Adding Support for a New Site

Edit `src/content.js` and add an entry to `SITE_CONFIGS`:

```js
"example.com": {
  username: 'input[name="email"]',
  password: 'input[name="password"]',
  submit: 'button[type="submit"]',
  delay: 500, // ms to wait before filling (for SPAs)
},
```

## Security Notes

- Credentials are only returned to authenticated **Admin** sessions
- Auto-submit is disabled by default — review the autofilled fields before logging in
- The extension never stores credentials locally; everything is fetched fresh from the Hub API
