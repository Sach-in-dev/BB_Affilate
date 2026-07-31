# BeautyBarn (BB) Affiliate Platform — Project Context

> A full-stack affiliate marketing platform for [BeautyBarn](https://beautybarn.in) / [26 Ritual](https://beta.26ritual.com), India's #1 K-Beauty destination. Creators (influencers) generate trackable affiliate links for beauty products and earn commissions on conversions. Admins manage users, products, roles, and campaigns.

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **Frontend (SPA)** | React + TypeScript | React 19, TS 5.8 |
| **Frontend (Landing)** | Static HTML/CSS/JS (vanilla) | — |
| **Build Tool** | Vite | 6.3 |
| **Styling** | Tailwind CSS v4 (via `@tailwindcss/vite`) + custom CSS design system | 4.1 |
| **UI Components** | Radix UI primitives + custom components | — |
| **Animations** | Framer Motion (SPA) + vanilla JS scroll/parallax (landing) | 12.x |
| **Routing** | React Router DOM | 7.6 |
| **HTTP Client** | Axios (with JWT interceptor) | 1.14 |
| **Backend** | FastAPI (Python) | 0.115 |
| **ORM** | SQLAlchemy (async) | 2.0 |
| **Database** | PostgreSQL (via asyncpg) | — |
| **Auth** | JWT (python-jose) + bcrypt | — |
| **Server** | Uvicorn | 0.30 |
| **Containerization** | Docker + Docker Compose | — |
| **Reverse Proxy** | Nginx (static landing + SPA serving + API proxy) | Alpine |
| **Deployment** | DigitalOcean Droplet (rsync + Docker) | — |

---

## Repository Structure

```
BB_Affiliate/
├── CONTEXT.md
├── HANDOFF.md
├── README.md
├── docker-compose.yml            # Dev: DB + API + UI (ports 5434, 8001, 5173)
├── docker-compose.prod.yml       # Prod: same services, SSL certs, port 80/443
├── deploy.sh                     # One-command deploy to DigitalOcean via rsync + Docker
├── backend/                      # FastAPI backend
│   ├── Dockerfile                # Multi-stage: python:3.12-slim + venv
│   ├── .env / .env.example       # Environment config
│   ├── requirements.txt          # Python dependencies
│   ├── run_seed.py               # Manual seed runner
│   ├── scripts/
│   │   └── sync_now.py           # Manual product sync script
│   ├── count_products.py         # Utility: count synced products
│   ├── get_products.py           # Utility: list synced products
│   ├── wipe_products.py          # Utility: clear product catalog
│   └── app/
│       ├── main.py               # FastAPI app entry, CORS, lifespan, router registration
│       ├── core/
│       │   ├── config.py         # Pydantic Settings (env vars)
│       │   ├── database.py       # Async SQLAlchemy engine + session
│       │   ├── security.py       # Password hashing, JWT create/decode
│       │   ├── permissions.py    # Permission keys, default roles, bootstrap admin
│       │   ├── seed.py           # Idempotent DB seeding (roles + super admin)
│       │   └── prod_db.py        # Read-only connection to BB production DB
│       ├── models/
│       │   ├── user.py           # User model (admin + creator, account_status, approval_status, soft delete, creator profile fields)
│       │   ├── role.py           # Role model (system roles with permissions)
│       │   ├── product.py        # Product model (synced from BB production)
│       │   ├── affiliate.py      # AffiliateLink (with is_active flag), AffiliateLinkItem, LinkClick
│       │   ├── activity_log.py   # ActivityLog model (tracks creator/admin management actions)
│       │   └── banner.py         # Banner model
│       ├── schemas/
│       │   ├── auth.py           # Login/signup request/response schemas
│       │   ├── admin.py          # Admin user CRUD schemas
│       │   ├── catalog.py        # Product catalog schemas
│       │   └── user_management.py # Creator management request/response schemas
│       ├── routers/
│       │   ├── auth.py           # /api/auth/* (signup, login, logout, me, suspended account check)
│       │   ├── admin.py          # /api/admin/* (users, roles CRUD, admin user status/restore/activity)
│       │   ├── user_management.py # /api/admin/creator-management/* (creator CRUD, status, bulk actions, export, activity logs)
│       │   ├── products.py       # /api/products/* (catalog, trending, sync)
│       │   ├── creator.py        # /api/creator/* (links, stats, profile)
│       │   ├── public.py         # /api/public/* (resolve links, click tracking, is_active check)
│       │   └── banners.py        # /api/creator/banners
│       └── services/
│           ├── links.py          # Link code generation logic
│           └── product_sync.py   # Sync products from BB production DB
│
└── frontend/                     # React SPA + Static Landing Page
    ├── Dockerfile                # Multi-stage: node:20-alpine build → nginx:alpine serve
    ├── nginx.conf                # Dev nginx: static landing at /, SPA fallback, /api proxy
    ├── nginx.prod.conf           # Prod nginx: SSL (Let's Encrypt), HTTPS redirect, same routing
    ├── package.json
    ├── vite.config.ts            # Vite config with /api proxy to :8001
    ├── index.html
    ├── public/
    │   ├── landing.html          # Static landing page (served at / by nginx, bypasses React SPA)
    │   ├── css/
    │   │   └── styles.css        # Landing page design system (terra/ink palette, typography, layouts)
    │   ├── js/
    │   │   ├── main.js           # Landing page interactivity (carousel, calculator, FAQ, scroll effects)
    │   │   └── motion.js         # Landing page animation utilities
    │   ├── assets/
    │   │   ├── brand/            # BeautyBarn/26Ritual logos, brand imagery
    │   │   ├── creators/         # Creator profile photos (.webp)
    │   │   ├── home/             # Landing page images (testimonials, earning cards, demo video)
    │   │   ├── streamers/        # Streamer imagery
    │   │   ├── fonts/            # Custom fonts (Playfair Display, DM Sans, DM Mono)
    │   │   ├── img/              # Misc images
    │   │   └── video/            # Demo videos
    │   └── images/               # Legacy product images (hero + brands)
    └── src/
        ├── main.tsx              # App entry: BrowserRouter + ThemeProvider + AuthProvider + Routes
        ├── index.css             # Tailwind v4 imports + 26 Ritual branded CSS custom properties (terra/ink palette)
        ├── contexts/
        │   ├── AuthContext.tsx    # Auth state, route guards, JWT session
        │   ├── SelectionContext.tsx # Multi-product selection state for link generation
        │   └── ThemeContext.tsx   # Dark/light/system theme provider (persists to localStorage)
        ├── lib/
        │   ├── axios.ts          # Axios instance with Bearer token interceptor
        │   ├── creator-api.ts    # Creator API functions
        │   ├── admin-api.ts      # Admin API functions (users, roles, permissions, creator management)
        │   ├── public-api.ts     # Public API functions
        │   └── utils.ts          # cn() utility (clsx + tailwind-merge)
        ├── hooks/
        │   └── use-mobile.ts     # Mobile breakpoint hook
        ├── components/
        │   ├── ThemeToggle.tsx    # Dark/light mode toggle (Sun/Moon icons)
        │   ├── ProductCard.tsx    # Reusable product card
        │   ├── SelectionBar.tsx   # Multi-select action bar
        │   ├── LinkResultDialog.tsx # Post-link-creation dialog
        │   ├── landing/          # React landing page sub-components (served at /landing-page-1)
        │   │   ├── LandingNavbar.tsx
        │   │   ├── SectionBadge.tsx
        │   │   ├── SectionHeading.tsx
        │   │   ├── FeatureCard.tsx
        │   │   ├── StepTimeline.tsx
        │   │   ├── FaqAccordion.tsx
        │   │   ├── LandingFooter.tsx
        │   │   ├── WaitlistForm.tsx       # Creator waitlist form → Google Sheets
        │   │   ├── AutomationDemo.tsx     # Comment-to-DM automation preview cards
        │   │   └── DashboardMock.tsx      # Floating hero dashboard mock
        │   ├── layout/           # CreatorLayout, AdminLayout, Sidebars ("26ritual" branding), Header
        │   └── ui/               # Radix-based primitives (button, card, dialog, etc.)
        └── pages/
            ├── LandingPage.tsx    # React landing page (now at /landing-page-1, replaced by static landing at /)
            ├── LoginPage.tsx      # Auth: login form
            ├── SignupPage.tsx     # Auth: registration form
            ├── public/
            │   ├── ResolveLinkPage.tsx    # Resolves /r/:code → redirect or bundle
            │   └── BundleLandingPage.tsx  # Multi-product bundle page
            ├── creator/
            │   ├── CreatorHomePage.tsx     # Dashboard home (stats, top products)
            │   ├── CreatorProductsPage.tsx # Browse & generate links
            │   ├── CreatorLinksPage.tsx    # Manage affiliate links
            │   ├── CreatorAnalyticsPage.tsx # Analytics & charts
            │   └── CreatorProfilePage.tsx  # Edit profile
            └── admin/
                ├── AdminDashboardPage.tsx  # Admin overview
                ├── RolesPermissionsPage.tsx # Manage admin users & roles (original admin users page)
                ├── AdminRolesPage.tsx      # Dedicated roles CRUD page
                ├── RoleFormDialog.tsx      # Create/edit role dialog
                ├── UserFormDialog.tsx      # Create/edit admin user dialog
                ├── UserManagementPage.tsx  # Creator Management page (list, create, status, bulk actions, export)
                ├── UserDetailDialog.tsx    # View creator details dialog
                ├── UserEditDialog.tsx      # Edit creator dialog
                ├── ConfirmDialog.tsx       # Reusable confirmation dialog
                └── ComingSoonPage.tsx      # Placeholder for unbuilt sections
```

---

## Architecture

### Dual Landing Page Architecture
The platform has two landing pages:
1. **Static landing page** (`public/landing.html`) — served at `/` by nginx (bypasses React SPA entirely). A fully standalone HTML/CSS/JS page branded as "26 Ritual" with its own design system. See **Static Landing Page Sections** below for full details.
2. **React landing page** (`LandingPage.tsx`) — now served at `/landing-page-1`. Uses React components (LandingNavbar, WaitlistForm, DashboardMock, etc.).

Nginx routing: `location = /` → `try_files /landing.html =404`. All other routes fall through to the React SPA via `try_files $uri $uri/ /index.html`.

### Static Landing Page Sections (top to bottom)
The primary public-facing page (`landing.html`) has the following sections:

1. **Nav** — "26 Ritual" brand logo, Login link, "Join as Creator" CTA button, mobile hamburger menu with slide-down panel (Creators, Resources, Auth groups)
2. **Hero** — Gradient background with grid overlay and glow effect. Eyebrow pill badge ("EARN UP TO 20% COMMISSION — INDIA'S K-BEAUTY CREATOR NETWORK"), headline "Where Beauty Creators Come to Earn.", subtext, and CTA button
3. **Industry** — "Every Skin Type. One Community." Two horizontally auto-scrolling rows of category tiles with brand images (Skincare, Acne Care, K-Beauty, Anti-Aging, Makeup, Haircare, Wellness, Sunscreen, Routines, Reviews, etc.)
4. **Dashboard Preview** — "Think and Operate Like An Entrepreneur" with a 4-panel bento grid: Audience Broadcasts (with mini earning rows), Real-Time Earnings (live animated feed), Content Library (with chip tags), Smart Scheduler (with calendar grid)
5. **Monetize / Bento Grid** — "Monetize What Moves You" with 7 cards: Affiliate Commissions (featured), Brand Collabs, Skin Consults, Live Shopping, Community Groups, Curated Edits, Exclusive Discount Codes
6. **Earnings Calculator** — Interactive calculator with two sliders (audience size 100–50K, avg order value ₹300–₹5,000), calculates monthly/yearly earnings at 8% conversion and 20% commission, animated number tweening
7. **Chat / Connect** — "Connect More, Earn More" with a phone-style device mockup showing a group chat UI (Skinbee Circle), chat bubbles, locked content unlocking, live avatar animations, community sales counter (₹12.4L)
8. **Everything In One Place** — "Power Features To Increase Revenue" with a product image, floating earnings chip (₹54,300 with +12.5% growth sparkline), and creator testimonial bubble
9. **Brands Marquee** — Infinite-scroll brand logo marquee: COSRX, AXIS-Y, Beauty of Joseon, VT Cosmetics, I'm from
10. **Content Protection / Creator Tools** — "Powerful Tools & Real Creator Support" with 4 feature items: Verified Links, Performance Analytics, Dedicated Creator Support, On-Time Payouts
11. **FAQ** — 5 accordion items: commission rates, referral program, payout speed, minimum followers, product purchase requirement
12. **Strategic Partner** — Comparison table (26 Ritual vs Others) for CRM & Automations, Instant Payouts, Dedicated Success Manager, Data Ownership. "We Guide You Every Step of the Way" copy with CTA
13. **Business Backbone / Chart** — "Deep Insights. Instant Payouts." with stats (₹2.4L avg monthly, ₹82k available), SVG area chart showing monthly earnings growth (+124% YoY)
14. **Testimonials** — "Creators Are Crushing It" with 11 testimonial cards showing creator avatars, handles, niches, and quotes
15. **Final CTA** — "Ready to Get Rewarded For What You Do Best?" with 3 checkmarks (Tracked affiliate links, On-time monthly payouts, Dedicated creator support) and Apply button
16. **Waitlist Form** — Full application form with: Full Name, Email, Instagram Account Link (required), Platform promotion details (dynamic add/remove rows with platform select + details), Social Media Links (optional, dynamic add/remove), Additional Information textarea, T&C checkbox, Submit button. Submits to Google Apps Script endpoint via `no-cors` POST
17. **Footer** — "26 Ritual" brand, tagline, copyright, version number, "Your Skin. Your Story. Your Earnings." tagline
18. **Floating elements** — Mobile sticky CTA ("Become a creator →"), Theme toggle button (sun icon)

### Theme System
- **ThemeContext** (`ThemeContext.tsx`) wraps the entire app, providing dark/light/system mode support
- Default theme: `dark`, persisted to `localStorage` under key `vite-ui-theme`
- Applies `light` or `dark` CSS class on `<html>` element
- **26 Ritual branded palette** defined in `index.css`:
  - Light mode: cream background `#FDF6EE`, ink foreground `#2C2420`, terra primary `#C4785A`, blush secondary `#F2D4C8`
  - Dark mode: ink background `#2C2420`, cream foreground `#FDF6EE`, same terra primary
- Smooth theme transitions via CSS `transition` on body
- Static landing page has its own independent theme toggle via `data-theme` attribute

### Branding
- Sidebars display "26ritual" brand name with "26" in terra (primary) color and "ritual" in white
- Admin sidebar header: "Admin Portal"; Creator sidebar header: "Creator Studio"
- Active nav item has a vertical terra-colored indicator bar

### Authentication Flow
1. **Signup** → `POST /api/auth/signup` → creates `user_type="creator"` → redirects to `/login`
2. **Login** → `POST /api/auth/login` → returns JWT → stored in `localStorage`
3. **Session restore** → `AuthContext` reads token from `localStorage` → calls `GET /api/auth/me` → populates `user` state
4. **Route guards** (in `AuthContext.tsx`):
   - Unauthenticated users on protected routes → redirect to `/login`
   - Authenticated users on `/login` or `/signup` → redirect to their home (`/dashboard` or `/admin`)
   - Creators cannot access `/admin/*`; admins cannot access `/dashboard/*`
5. **Logout** → `POST /api/auth/logout` + clear `localStorage` → redirect to `/login`

### API Proxy
- **Dev**: Vite proxies `/api` requests to `http://localhost:8001` (configured in `vite.config.ts`)
- **Prod**: Nginx proxies `/api/` to `http://api:8001` (configured in `frontend/nginx.prod.conf`)

### Database
- **Primary DB**: PostgreSQL (`DATABASE_URL` in `.env`) — the affiliate platform's own data
- **Production DB**: Read-only connection to BeautyBarn's live DB (`PROD_DB_URL`) — used only to sync the product catalog
- Tables auto-created on startup via `Base.metadata.create_all`
- Default roles and super admin seeded idempotently on startup

### User Types & Roles
| Type | Access | Roles |
|---|---|---|
| `creator` | `/dashboard/*` — manage links, view products, analytics, profile | None (no role model) |
| `admin` | `/admin/*` — manage users, products, campaigns, analytics | `super_admin`, `admin`, `manager`, `viewer` |

### Affiliate Link Flow
1. Creator browses products → selects 1+ products (via `SelectionContext`) → generates link (single or bundle)
2. System creates `AffiliateLink` + `AffiliateLinkItem` rows, generates unique short code
3. Customer visits `/r/:code` → `ResolveLinkPage` calls `/api/public/resolve/:code`
4. System checks `is_active` flag on the link — if `false` (creator suspended), returns 403
5. **Single link** → redirect to BeautyBarn product page
6. **Bundle link** → render `BundleLandingPage` with all products
7. Each visit records a `LinkClick` for attribution tracking

### Creator Suspension & Link Deactivation
- When an admin suspends a creator (sets `account_status` to `suspended`), all of that creator's affiliate links are automatically deactivated (`is_active = false`)
- When the creator is reactivated (`account_status` set back to `active`), all their links are automatically reactivated
- Suspended creators see an "Account Deactivated" message on login attempt
- This applies to all link types (single and bundle) for the individual creator

### Deployment Architecture
```
Developer machine
    ↓ rsync (deploy.sh)
DigitalOcean Droplet (64.227.163.108)
    ↓ docker compose -f docker-compose.prod.yml up --build
    ├── postgres:17-alpine (internal)
    ├── bb-affiliate-api (FastAPI on :8001, internal)
    └── bb-affiliate-ui (Nginx on :80/:443, public)
        ├── Serves static landing page at /
        ├── Serves React SPA for all other routes
        ├── Proxies /api/ → api:8001
        └── SSL via Let's Encrypt certs (/etc/letsencrypt)
```

Live URL: **https://beta.26ritual.com**

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | Async PostgreSQL connection string | `postgresql+asyncpg://postgres@localhost:5432/bb_affiliate` |
| `PROD_DB_URL` | Read-only BB production DB (for product sync) | `None` |
| `SECRET_KEY` | JWT signing key | `change-this-...` |
| `STOREFRONT_BASE_URL` | BeautyBarn customer-facing URL | `https://beautybarn.in` |
| `ASSET_CDN_BASE_URL` | CDN for product images | `https://bb-asset.blr1.cdn.digitaloceanspaces.com` |
| `AFFILIATE_BASE_URL` | Base URL for generated affiliate links | `http://localhost:5173` |
| `PRODUCT_SYNC_LIMIT` | Max products to pull from production | `20` |
| `CORS_ORIGINS` | Allowed CORS origins (comma-separated) | `http://localhost:5173` |
| `POSTGRES_USER` | Docker Compose DB user | `postgres` |
| `POSTGRES_PASSWORD` | Docker Compose DB password | `supersecretpassword` (dev) |
| `POSTGRES_DB` | Docker Compose DB name | `bb_affiliate` |
| `VITE_GOOGLE_SHEET_URL` | Google Apps Script endpoint for waitlist form | (hardcoded fallback) |

---

## Running Locally

### Option A: Docker Compose (recommended)
```bash
docker compose up --build
# Frontend: http://localhost:5173
# Backend:  http://localhost:8001
# Postgres: localhost:5434
```

### Option B: Manual
```bash
# Backend
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # edit DATABASE_URL, SECRET_KEY, etc.
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload

# Frontend
cd frontend
npm install
npm run dev            # → http://localhost:5173
```

### Deploying to Production
```bash
./deploy.sh
# Syncs files via rsync to 64.227.163.108, rebuilds Docker containers
# Live at https://beta.26ritual.com
```

### Default Credentials
| Role | Email | Password |
|---|---|---|
| Super Admin | `admin@beautybarn.in` | `Admin@123` |

---

## Key Conventions

- **CSS**: Tailwind v4 utility classes (SPA); standalone CSS design system with terra/ink palette (static landing)
- **State Management**: React Context (`AuthContext`, `SelectionContext`, `ThemeContext`) — no Redux/Zustand
- **API Layer**: Typed API functions in `lib/creator-api.ts`, `lib/admin-api.ts`, `lib/public-api.ts`
- **Component Library**: Radix UI primitives wrapped in `components/ui/` with CVA variants
- **Theme**: Dark mode default. `ThemeContext` provides dark/light/system modes, persisted in `localStorage`. Branded 26 Ritual terra/ink color palette in `index.css`
- **Path Alias**: `@/` maps to `src/` (configured in `vite.config.ts` and `tsconfig.json`)
- **Containerization**: Multi-stage Docker builds for both frontend (node → nginx) and backend (python builder → runtime)
- **Deployment**: Single `deploy.sh` script; rsync + remote Docker Compose rebuild
- **Branding**: "26 Ritual" branding in sidebars and static landing; "BeautyBarn" for product/storefront references
