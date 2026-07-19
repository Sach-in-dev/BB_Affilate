# BeautyBarn (BB) Affiliate Platform — Project Context

> A full-stack affiliate marketing platform for [BeautyBarn](https://beautybarn.in), India's #1 K-Beauty destination. Creators (influencers) generate trackable affiliate links for beauty products and earn commissions on conversions. Admins manage users, products, roles, and campaigns.

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **Frontend** | React + TypeScript | React 19, TS 5.8 |
| **Build Tool** | Vite | 6.3 |
| **Styling** | Tailwind CSS v4 (via `@tailwindcss/vite`) | 4.1 |
| **UI Components** | Radix UI primitives + custom components | — |
| **Animations** | Framer Motion | 12.x |
| **Routing** | React Router DOM | 7.6 |
| **HTTP Client** | Axios (with JWT interceptor) | 1.14 |
| **Backend** | FastAPI (Python) | 0.115 |
| **ORM** | SQLAlchemy (async) | 2.0 |
| **Database** | PostgreSQL (via asyncpg) | — |
| **Auth** | JWT (python-jose) + bcrypt | — |
| **Server** | Uvicorn | 0.30 |

---

## Repository Structure

```
BB_Affiliate/
├── .gitignore
├── README.md
└── bb/
    ├── backend/                      # FastAPI backend
    │   ├── .env / .env.example       # Environment config
    │   ├── requirements.txt          # Python dependencies
    │   ├── bb_dashboard.db           # SQLite fallback (dev only, gitignored)
    │   ├── venv/                     # Virtual environment (gitignored)
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
    │       │   ├── user.py           # User model (admin + creator, profile fields)
    │       │   ├── role.py           # Role model (system roles with permissions)
    │       │   ├── product.py        # Product model (synced from BB production)
    │       │   ├── affiliate.py      # AffiliateLink, AffiliateLinkItem, LinkClick
    │       │   └── banner.py         # Banner model
    │       ├── schemas/
    │       │   ├── auth.py           # Login/signup request/response schemas
    │       │   ├── admin.py          # Admin user CRUD schemas
    │       │   └── catalog.py        # Product catalog schemas
    │       ├── routers/
    │       │   ├── auth.py           # /api/auth/* (signup, login, logout, me)
    │       │   ├── admin.py          # /api/admin/* (users, roles CRUD)
    │       │   ├── products.py       # /api/products/* (catalog, trending, sync)
    │       │   ├── creator.py        # /api/creator/* (links, stats, profile)
    │       │   ├── public.py         # /api/public/* (resolve links, click tracking)
    │       │   └── banners.py        # /api/creator/banners
    │       └── services/
    │           ├── links.py          # Link code generation logic
    │           └── product_sync.py   # Sync products from BB production DB
    │
    └── frontend/                     # React SPA
        ├── package.json
        ├── vite.config.ts            # Vite config with /api proxy to :8001
        ├── index.html
        ├── public/
        │   └── images/               # Generated product images (hero + brands)
        └── src/
            ├── main.tsx              # App entry: BrowserRouter + AuthProvider + Routes
            ├── index.css             # Tailwind v4 imports + CSS custom properties
            ├── contexts/
            │   └── AuthContext.tsx    # Auth state, route guards, JWT session
            ├── lib/
            │   ├── axios.ts          # Axios instance with Bearer token interceptor
            │   ├── creator-api.ts    # Creator API functions
            │   ├── admin-api.ts      # Admin API functions
            │   ├── public-api.ts     # Public API functions
            │   └── utils.ts          # cn() utility (clsx + tailwind-merge)
            ├── hooks/
            │   └── use-mobile.ts     # Mobile breakpoint hook
            ├── components/
            │   ├── ThemeToggle.tsx    # Dark/light mode toggle (defaults dark)
            │   ├── ProductCard.tsx    # Reusable product card
            │   ├── SelectionBar.tsx   # Multi-select action bar
            │   ├── LinkResultDialog.tsx # Post-link-creation dialog
            │   ├── landing/          # 9 landing page sub-components
            │   ├── layout/           # CreatorLayout, AdminLayout, Sidebars, Header
            │   └── ui/               # Radix-based primitives (button, card, dialog, etc.)
            └── pages/
                ├── LandingPage.tsx    # Public marketing page
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
                    ├── RolesPermissionsPage.tsx # Manage users & roles
                    ├── UserFormDialog.tsx      # Create/edit admin user dialog
                    └── ComingSoonPage.tsx      # Placeholder for unbuilt sections
```

---

## Architecture

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
Vite proxies `/api` requests to `http://localhost:8001` during development (configured in `vite.config.ts`).

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
1. Creator browses products → selects 1+ products → generates link (single or bundle)
2. System creates `AffiliateLink` + `AffiliateLinkItem` rows, generates unique short code
3. Customer visits `/r/:code` → `ResolveLinkPage` calls `/api/public/resolve/:code`
4. **Single link** → redirect to BeautyBarn product page
5. **Bundle link** → render `BundleLandingPage` with all products
6. Each visit records a `LinkClick` for attribution tracking

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

---

## Running Locally

```bash
# Backend
cd bb/backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # edit DATABASE_URL, SECRET_KEY, etc.
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload

# Frontend
cd bb/frontend
npm install
npm run dev            # → http://localhost:5173
```

### Default Credentials
| Role | Email | Password |
|---|---|---|
| Super Admin | `admin@beautybarn.in` | `Admin@123` |

---

## Key Conventions

- **CSS**: Tailwind v4 utility classes for dashboard; custom CSS for landing page components
- **State Management**: React Context (`AuthContext`) — no Redux/Zustand
- **API Layer**: Typed API functions in `lib/creator-api.ts`, `lib/admin-api.ts`, `lib/public-api.ts`
- **Component Library**: Radix UI primitives wrapped in `components/ui/` with CVA variants
- **Theme**: Dark mode default. Toggle via `ThemeToggle.tsx` (persisted in `localStorage`)
- **Path Alias**: `@/` maps to `src/` (configured in `vite.config.ts` and `tsconfig.json`)
