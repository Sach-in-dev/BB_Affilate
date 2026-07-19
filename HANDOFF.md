# BeautyBarn Affiliate Platform — Handoff Document

> Last updated: 2026-07-19
> Repo: https://github.com/Sach-in-dev/BB_Affilate
> Branch: `main`

---

## What Is This Project?

The **BeautyBarn Affiliate Platform** is a full-stack web application that enables beauty content creators (influencers) to generate unique affiliate links for BeautyBarn's K-Beauty product catalog. Creators share these links on social media; customer clicks and conversions are tracked, and creators earn commissions.

The platform has three user-facing surfaces:
1. **Public Landing Page** — marketing page at `/` to attract new creators
2. **Creator Dashboard** — at `/dashboard/*` for creators to manage links, view analytics, and edit their profile
3. **Admin Portal** — at `/admin/*` for BeautyBarn staff to manage users, roles, products, and campaigns

---

## Current State of the Project

### What's Built & Working ✅

| Feature | Status | Notes |
|---|---|---|
| **Landing Page** | ✅ Complete | Premium responsive design with hero, stats, brand carousel, how-it-works timeline, benefits grid, FAQ accordion, CTA, and footer |
| **Auth (Signup/Login/Logout)** | ✅ Complete | JWT-based auth with localStorage persistence, route guards, role-based redirects |
| **Creator Dashboard — Home** | ✅ Complete | Stats cards (clicks, orders, commission, conversion rate), top products, recent activity, trending products, promotional banners |
| **Creator Dashboard — Products** | ✅ Complete | Browse synced product catalog, search/filter, generate single or bundle affiliate links |
| **Creator Dashboard — My Links** | ✅ Complete | View all generated links with click stats, copy to clipboard |
| **Creator Dashboard — Analytics** | ✅ Complete | Click/conversion analytics with charts |
| **Creator Dashboard — Profile** | ✅ Complete | Edit name, handle, bio, social links, niche, city/state |
| **Admin — Dashboard** | ✅ Complete | Overview stats for admin users |
| **Admin — Users & Roles** | ✅ Complete | Full CRUD for admin users, role assignment, permission management |
| **Affiliate Link Resolution** | ✅ Complete | `/r/:code` resolves links: single → redirect to product page, bundle → branded landing page |
| **Click Tracking** | ✅ Complete | Every link visit records a `LinkClick` with source, referrer, user agent, IP |
| **Product Sync** | ✅ Complete | Pulls products from BB production DB (read-only) into local catalog |
| **Dark Mode** | ✅ Complete | Defaults to dark, persists preference in localStorage |
| **Theme Toggle** | ✅ Complete | Available on all pages (landing navbar, login/signup, dashboard header) |

### What's Placeholder / Coming Soon 🚧

| Feature | Status | Notes |
|---|---|---|
| Admin — Commissions | 🚧 `ComingSoonPage` | UI placeholder only |
| Admin — Campaigns | 🚧 `ComingSoonPage` | UI placeholder only |
| Admin — Products | 🚧 `ComingSoonPage` | UI placeholder only |
| Admin — Creators | 🚧 `ComingSoonPage` | UI placeholder only |
| Admin — Banners | 🚧 `ComingSoonPage` | UI placeholder only |
| Admin — Links | 🚧 `ComingSoonPage` | UI placeholder only |
| Admin — Analytics | 🚧 `ComingSoonPage` | UI placeholder only |
| Commission Calculation | 🚧 Not implemented | No actual payout logic yet |
| Order Tracking Integration | 🚧 Not implemented | No webhook from BB store to track conversions |
| Email Notifications | ❌ Not started | No email service integrated |
| Forgot Password | ❌ Not started | No password reset flow |

---

## Commit History

| Commit | Description |
|---|---|
| `95f4319` | Initial commit |
| `afe5c28` | Core platform: auth, RBAC admin, product sync, creator dashboard, link tracking |
| `39577b7` | Redesign landing page, fix signup redirect |
| `bf10a37` | Landing page polish, dark mode default, sidebar logo link, profile dropdown nav |

---

## Architecture Decisions

### Why JWT in localStorage (not cookies)?
Simple SPA auth pattern. The token is attached via Axios interceptor. For production, consider switching to HttpOnly cookies to mitigate XSS risks.

### Why no state management library?
The app's state is simple enough that React Context (`AuthContext`) handles everything. If the app grows significantly (real-time notifications, complex caching), consider adding TanStack Query or Zustand.

### Why Tailwind v4?
The project uses `@tailwindcss/vite` plugin (Tailwind v4) which requires no `tailwind.config.js`. Custom properties are defined directly in `index.css`.

### Why custom CSS for the landing page?
The landing page components use Tailwind utilities like the rest of the app. The previous version had a separate `LandingPage.css` but it was refactored into component-based Tailwind styling.

### Database schema auto-creation
Tables are created via `Base.metadata.create_all` on startup. For production, switch to Alembic migrations (already in `requirements.txt` but not configured).

---

## Known Issues & Tech Debt

1. **No Alembic migrations** — Schema changes are managed by SQLAlchemy auto-create, which won't handle column modifications. Set up Alembic before any schema changes in production.
2. **CORS hardcoded** — `allow_origins` is set to `["http://localhost:5173"]` in `main.py`. Must be configured for production domain.
3. **Default admin password** — `Admin@123` is hardcoded in `permissions.py`. Change on first deployment.
4. **No rate limiting** — Auth endpoints have no brute-force protection.
5. **No email verification** — Signups are immediately active without email confirmation.
6. **Product images** — Brand carousel uses AI-generated placeholder images in `public/images/`. Replace with actual brand imagery for production.

---

## How to Continue Development

### Adding a new admin feature (e.g., Commissions page)
1. **Backend**: Create router in `app/routers/commissions.py`, register in `app/main.py`
2. **Frontend**: Create page in `src/pages/admin/CommissionsPage.tsx`
3. **Route**: Replace `ComingSoonPage` with the new component in `src/main.tsx`
4. **API**: Add functions to `src/lib/admin-api.ts`

### Adding a new creator feature
1. **Backend**: Add endpoint to `app/routers/creator.py`
2. **Frontend**: Create/edit page in `src/pages/creator/`
3. **Route**: Add route under the `/dashboard` layout in `src/main.tsx`
4. **Sidebar**: Add nav item in `src/components/layout/CreatorSidebar.tsx`
5. **API**: Add functions to `src/lib/creator-api.ts`

### Deploying to production
1. Set up PostgreSQL and configure `DATABASE_URL` and `PROD_DB_URL`
2. Generate a secure `SECRET_KEY`
3. Update `CORS allow_origins` in `app/main.py`
4. Update `AFFILIATE_BASE_URL` to production domain
5. Run `npm run build` for the frontend, serve `dist/` via Nginx or similar
6. Run backend with `gunicorn` + `uvicorn` workers
7. Set up Alembic for database migrations

---

## Contacts & Resources

| Resource | Link |
|---|---|
| GitHub Repo | https://github.com/Sach-in-dev/BB_Affilate |
| BeautyBarn Storefront | https://beautybarn.in |
| Asset CDN | https://bb-asset.blr1.cdn.digitaloceanspaces.com |
| Design Reference | https://business.ikshvakusolutions.com/ |
