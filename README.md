# Formium Hub

A centralized internal dashboard for managing and launching company accounts and tools — combining a password vault with an application launcher.

## Features

- 🔐 Secure authentication with NextAuth (credentials provider)
- 🗂️ Dashboard of account cards (icon, title, category, actions)
- ➕ Add / edit / delete cards with AES-256 encrypted password storage
- 🔍 Search by title, URL, category
- 🏷️ Category filters (Marketing, Technology, Hosting, Finance, Clients, Operations, Internal)
- ⭐ Favorites & recently used tracking
- 📊 Dashboard statistics
- 📝 Audit logs (admin only)
- 🌗 Dark / light mode
- 🧩 Companion Chrome Extension (Manifest V3) for credential autofill
- 🛡️ Role-based access (Admin / Manager / User) — only Admins can view credentials
- ⚡ Rate limiting, secure cookies, security headers

---

## Tech Stack

| Layer        | Technology              |
|--------------|--------------------------|
| Framework    | Next.js 15 (App Router)  |
| Language     | TypeScript               |
| Styling      | Tailwind CSS             |
| Database     | PostgreSQL               |
| ORM          | Prisma                   |
| Auth         | NextAuth v5               |
| Encryption   | AES-256-GCM (Node crypto) |
| Icons        | Lucide React             |
| Extension    | Chrome Manifest V3       |

---

## Project Structure

```
formium-hub/
├── src/
│   ├── app/
│   │   ├── api/                  # REST API routes
│   │   │   ├── auth/[...nextauth]/
│   │   │   ├── cards/             # GET/POST cards, [id] GET/PUT/DELETE
│   │   │   ├── credentials/[id]/  # Secure decrypt endpoint (admin)
│   │   │   ├── audit/             # Audit logs (admin)
│   │   │   └── stats/             # Dashboard statistics
│   │   ├── dashboard/             # Protected dashboard pages
│   │   │   ├── favorites/
│   │   │   ├── recent/
│   │   │   ├── stats/
│   │   │   └── audit/
│   │   ├── login/                 # Login page
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── cards/                 # AccountCard, StatsBar
│   │   ├── forms/                 # LoginForm, CardModal
│   │   └── layout/                # Sidebar, ThemeProvider, Providers
│   ├── hooks/                     # useCards, useStats
│   ├── lib/                       # auth, prisma, encryption, api utils
│   └── types/                     # Shared TypeScript types
├── prisma/
│   ├── schema.prisma               # Database schema
│   └── seed.ts                     # Seed script
├── chrome-extension/
│   ├── manifest.json
│   └── src/
│       ├── background.js           # Service worker
│       ├── content.js               # Autofill logic
│       ├── popup.html / popup.js
├── middleware.ts                   # Route protection
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

---

## 1. Installation Guide (Local Development)

### Prerequisites

- Node.js 20+
- PostgreSQL 14+ (local or remote)
- npm

### Steps

1. **Clone & install dependencies**

   ```bash
   cd formium-hub
   npm install
   ```

2. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Generate secrets:

   ```bash
   # NEXTAUTH_SECRET
   openssl rand -base64 32

   # ENCRYPTION_KEY (must be 64 hex chars = 32 bytes for AES-256)
   openssl rand -hex 32
   ```

   Fill in `.env`:

   ```env
   DATABASE_URL="postgresql://formium:yourpassword@localhost:5432/formium_hub"
   NEXTAUTH_SECRET="<generated-secret>"
   NEXTAUTH_URL="http://localhost:3000"
   ENCRYPTION_KEY="<64-char-hex-key>"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

3. **Set up the database**

   ```bash
   # Create the Postgres database (if not already created)
   createdb formium_hub

   # Run migrations
   npx prisma migrate dev --name init

   # Seed with admin user + sample cards
   npm run db:seed
   ```

   Default admin credentials (change immediately):
   - Email: `admin@formiumhub.com`
   - Password: `admin123!`

4. **Run the dev server**

   ```bash
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000)

---

## 2. Chrome Extension Setup

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `chrome-extension/` folder
5. The Formium Hub icon will appear in your toolbar

> **Note:** Replace placeholder icon files in `chrome-extension/icons/` with real `.png` files (16x16, 48x48, 128x128).

### How it works

1. User clicks **Open** on a card in Formium Hub
2. The target site opens in a new tab with `?fhAccountId=<cardId>` in the URL
3. The content script detects this parameter
4. It asks the background service worker to fetch credentials via `/api/credentials/:id` (using the existing session cookie)
5. Only **Admin** users can successfully fetch credentials (returns 403 otherwise)
6. The extension fills in the username/password fields for supported sites

### Supported sites (pre-configured)

- Instagram
- Facebook
- Canva
- Dynadot
- WordPress Admin
- cPanel

Add more by editing `SITE_CONFIGS` in `chrome-extension/src/content.js`.

### Updating the Hub URL

Edit `FORMIUM_HUB_URL` in:
- `chrome-extension/src/background.js`
- `chrome-extension/src/popup.js`

And add the production domain to `host_permissions` in `manifest.json`.

---

## 3. Deployment Guide — VPS (Manual)

### Prerequisites

- Ubuntu 22.04+ VPS
- Node.js 20+, PostgreSQL 16, Nginx, PM2

### Steps

```bash
# 1. Install dependencies
sudo apt update
sudo apt install -y nodejs npm postgresql nginx

# 2. Clone the project
git clone <your-repo-url> /var/www/formium-hub
cd /var/www/formium-hub
npm install

# 3. Configure environment
cp .env.example .env
nano .env   # fill in production values

# 4. Set up the database
sudo -u postgres createuser formium -P
sudo -u postgres createdb formium_hub -O formium

npx prisma migrate deploy
npm run db:seed   # optional, remove before going live with real data

# 5. Build the app
npm run build

# 6. Run with PM2
npm install -g pm2
pm2 start npm --name formium-hub -- start
pm2 save
pm2 startup
```

### Nginx reverse proxy config

```nginx
server {
    listen 80;
    server_name hub.yourcompany.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable HTTPS with Let's Encrypt:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d hub.yourcompany.com
```

Update `.env`:
```env
NEXTAUTH_URL="https://hub.yourcompany.com"
NEXT_PUBLIC_APP_URL="https://hub.yourcompany.com"
```

---

## 4. Deployment Guide — Docker

### Steps

1. Create a `.env` file in the project root (used by docker-compose):

   ```env
   DB_PASSWORD=your-strong-db-password
   NEXTAUTH_SECRET=your-generated-secret
   NEXTAUTH_URL=https://hub.yourcompany.com
   ENCRYPTION_KEY=your-64-char-hex-key
   NEXT_PUBLIC_APP_URL=https://hub.yourcompany.com
   ```

2. Build and start:

   ```bash
   docker compose up -d --build
   ```

3. Run migrations & seed (first time only):

   ```bash
   docker compose exec app npx prisma migrate deploy
   docker compose exec app npm run db:seed
   ```

4. The app is now available on port 3000. Put Nginx (or Traefik/Caddy) in front for HTTPS.

### Updating

```bash
git pull
docker compose up -d --build
docker compose exec app npx prisma migrate deploy
```

---

## Security Notes

- **Never commit `.env`** — it contains your encryption key and database credentials
- Rotate `ENCRYPTION_KEY` only with a re-encryption migration plan (changing it invalidates all stored passwords)
- Only **Admin** role can view/decrypt credentials — assign roles carefully via Prisma Studio (`npm run db:studio`) or direct DB access
- All API routes require an authenticated session
- Rate limiting is in-memory by default — for multi-instance deployments, replace with Redis (see `src/lib/api.ts`)
- The app sets `X-Frame-Options: DENY` and other security headers via `next.config.ts`

---

## Default Roles

| Role    | Permissions                                  |
|---------|-----------------------------------------------|
| ADMIN   | Full access, including viewing credentials & audit logs |
| MANAGER | Manage cards, no credential access           |
| USER    | View & open cards, no credential access      |

To promote a user to Admin:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'user@company.com';
```

---

## Scripts

| Command                | Description                       |
|-------------------------|------------------------------------|
| `npm run dev`           | Start development server          |
| `npm run build`         | Build for production               |
| `npm start`             | Start production server            |
| `npm run db:migrate`    | Run Prisma migrations (dev)        |
| `npm run db:migrate:prod` | Apply migrations (production)   |
| `npm run db:seed`       | Seed database with sample data     |
| `npm run db:studio`     | Open Prisma Studio (DB GUI)        |

---

## License

Internal/private use only.
