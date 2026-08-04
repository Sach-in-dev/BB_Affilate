# BeautyBarn Affiliate Platform — Handoff Document

> Last updated: 2026-08-04
> Repo: https://github.com/Sach-in-dev/BB_Affilate
> Branch: `main`
> Live: https://beta.26ritual.com

---

## What Is This Project?

The **BeautyBarn Affiliate Platform** (branded as **26 Ritual**) is a full-stack web application that enables beauty content creators (influencers) to generate unique affiliate links for BeautyBarn's K-Beauty product catalog. Creators share these links on social media; customer clicks and conversions are tracked, and creators earn commissions.

The platform has four user-facing surfaces:
1. **Static Landing Page** — premium standalone HTML/CSS/JS marketing page at `/` (bypasses React SPA), branded as "26 Ritual" with hero carousel, earnings calculator, testimonials, FAQ, scroll animations, and parallax effects
2. **React Landing Page** — original React-based marketing page, now at `/landing-page-1` with waitlist form, dashboard mock, and automation demo
3. **Creator Dashboard** — at `/dashboard/*` for creators to manage links, view analytics, and edit their profile
4. **Admin Portal** — at `/admin/*` for BeautyBarn staff to manage users, roles, products, and campaigns

---

## Current State of the Project

### What's Built & Working ✅

| Feature | Status | Notes |
|---|---|---|
| **Static Landing Page (26 Ritual)** | ✅ Complete | Standalone HTML/CSS/JS page at `/` (bypasses React SPA). 18 sections: nav with mobile menu, hero with gradient/glow/grid, industry category scroll rows, 4-panel dashboard preview (broadcasts, real-time earnings feed, content library, smart scheduler), monetize bento grid (7 revenue cards), interactive earnings calculator (audience/order sliders, animated tweening), chat device mockup with group chat UI, "Everything In One Place" feature showcase, brand marquee (COSRX, AXIS-Y, Beauty of Joseon, VT, I'm from), creator tools (verified links, analytics, support, payouts), FAQ accordion (5 items), comparison table (26 Ritual vs Others), earnings chart with SVG area graph, 11 testimonial cards, final CTA, waitlist application form (name, email, Instagram, dynamic platforms, social links, additional info → Google Sheets), footer. Plus floating mobile CTA and theme toggle |
| **React Landing Page** | ✅ Complete | React-based marketing page now at `/landing-page-1`. Hero, dashboard mock, automation demo, waitlist form (→ Google Sheets), stats, step timeline, feature cards, FAQ, CTA, footer |
| **26 Ritual Branded Theme** | ✅ Complete | Terra/ink color palette (terra `#C4785A`, ink `#2C2420`, cream `#FDF6EE`, blush `#F2D4C8`). ThemeContext provides dark/light/system modes. Persisted to localStorage. Smooth theme transitions. Both SPA and static landing page have independent theme toggles |
| **Waitlist Form + Admin Module** | ✅ Complete | Landing page form now submits to `/api/public/waitlist` (stored in DB, table `waitlist_entries`). Admin page at `/admin/waitlist` with search, paginated table, expandable rows, delete action, CSV export |
| **Auth (Signup/Login/Logout)** | ✅ Complete | JWT-based auth with localStorage persistence, route guards, role-based redirects |
| **Creator Dashboard — Home** | ✅ Complete | Stats cards (clicks, orders, commission, conversion rate), top products, recent activity, trending products, promotional banners |
| **Creator Dashboard — Products** | ✅ Complete | Browse synced product catalog, search/filter, multi-select via SelectionContext, generate single or bundle affiliate links |
| **Creator Dashboard — My Links** | ✅ Complete | View all generated links with click stats, copy to clipboard |
| **Creator Dashboard — Analytics** | ✅ Complete | Click/conversion analytics with charts |
| **Creator Dashboard — Profile** | ✅ Complete | Edit name, handle, bio, social links, niche, city/state |
| **Admin — Dashboard** | ✅ Complete | Overview stats for admin users |
| **Admin — Users & Roles** | ✅ Complete | Full CRUD for admin users, role assignment, permission management, status toggle, active/inactive |
| **Admin — Roles Management** | ✅ Complete | Dedicated page for CRUD operations on roles with permission assignment (AdminRolesPage + RoleFormDialog) |
| **Admin — Creator Management** | ✅ Complete | Dedicated page to list, create, view, edit, suspend/activate creators. Includes bulk actions, CSV export, activity logs, approval workflow, search/filter. Route: `/admin/creators` |
| **Creator Suspension & Link Deactivation** | ✅ Complete | Suspending a creator auto-deactivates all their affiliate links (`is_active=false`); reactivating restores them. Applies to both single and bundle links per creator |
| **Affiliate Link Resolution** | ✅ Complete | `/r/:code` resolves links: single → redirect to product page, bundle → branded landing page. Checks `is_active` flag — returns 403 if link deactivated |
| **Click Tracking** | ✅ Complete | Every link visit records a `LinkClick` with source, referrer, user agent, IP |
| **Product Sync** | ✅ Complete | Pulls products from BB production DB (read-only) into local catalog |
| **Theme System** | ✅ Complete | ThemeContext with dark/light/system modes. 26 Ritual branded terra/ink palette. Defaults to dark, persists in localStorage |
| **Docker Setup** | ✅ Complete | Full Docker Compose for dev (with exposed Postgres on :5434) and production |
| **Production Deployment** | ✅ Complete | One-command deploy via `deploy.sh` to DigitalOcean; Nginx reverse proxy with SSL. Separate `nginx.prod.conf` with HTTPS redirect and ACME challenge support |
| **Product Selection Context** | ✅ Complete | Dedicated `SelectionContext` for managing multi-product selection state |
| **Brand Assets** | ✅ Complete | Full asset directory structure: `public/assets/` with brand logos, creator photos (.webp), testimonial images, demo video, custom fonts (Playfair Display, DM Sans, DM Mono) |
| **Admin — Products** | ✅ Complete | Product catalog management at `/admin/products`. Stats cards (total, active, in-stock, affiliate-enabled), search by name/brand/SKU, filter by brand/category/status/stock, paginated table with expandable rows (rating, tags, synced date, affiliate toggle), CSV export |
| **Admin — Links & Analytics** | ✅ Complete | Link tracking at `/admin/links` with 3 tabs: **All Links** (paginated table with creator info, code, type, clicks, status toggle, expandable rows with URL/products/per-product clicks, filters, CSV export), **Click Log** (paginated click events with source filter), **Analytics** (summary stats, 30-day bar chart with hover tooltips, top traffic sources with progress bars) |

### What's Placeholder / Coming Soon 🚧

| Feature | Status | Notes |
|---|---|---|
| Admin — Commissions | 🚧 `ComingSoonPage` | UI placeholder only |
| Admin — Campaigns | 🚧 `ComingSoonPage` | UI placeholder only |
| Admin — Banners | 🚧 `ComingSoonPage` | UI placeholder only |
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
| `045a868` | Add Docker setup, CONTEXT.md, and HANDOFF.md |
| `be9840a` | Replace codebase entirely with new project code (restructured repo: removed `bb/` nesting, added Dockerfiles, nginx.conf, deploy script, waitlist form, automation demo, dashboard mock, SelectionContext, AdminRolesPage, RoleFormDialog, utility scripts) |
| `96e7408` | Add Creator Management module and auto link deactivation on suspension |
| `f45e6ba` | New static landing page (26 Ritual branded) and theme system overhaul (ThemeContext, terra/ink palette, dual landing page architecture) |
| `277aeb3` | Link fixes |
| `ded58d9` | Add Waitlist module — store submissions in DB and display in admin dashboard |
| `a53f9de` | Add CSV export for waitlist entries |

---

## Architecture Decisions

### Why a static landing page separate from the React SPA?
The primary landing page (`/`) is a standalone HTML/CSS/JS page served directly by nginx. This gives maximum performance (no React bundle load), full design control with a custom CSS design system (terra/ink palette, Playfair Display + DM Sans typography, scroll-reveal animations, parallax effects, auto-scrolling carousels), and independence from the SPA build pipeline. The static page has its own waitlist application form that submits directly to Google Apps Script (name, email, Instagram link, promotion platforms with dynamic rows, social links, additional info). The React landing page remains at `/landing-page-1` as an alternative/legacy version.

### Why JWT in localStorage (not cookies)?
Simple SPA auth pattern. The token is attached via Axios interceptor. For production, consider switching to HttpOnly cookies to mitigate XSS risks.

### Why no state management library?
The app's state is simple enough that React Context (`AuthContext`, `SelectionContext`, `ThemeContext`) handles everything. If the app grows significantly (real-time notifications, complex caching), consider adding TanStack Query or Zustand.

### Why Tailwind v4?
The project uses `@tailwindcss/vite` plugin (Tailwind v4) which requires no `tailwind.config.js`. Custom properties are defined directly in `index.css`.

### Why Docker Compose for everything?
Single `docker compose up` spins up Postgres, backend, and frontend. Same compose file structure for dev and prod, with prod adding SSL and tighter security. Eliminates "works on my machine" issues.

### Why Nginx in the frontend container?
The frontend Dockerfile builds the React app with Vite, then serves the static output via Nginx. Nginx serves the static landing page at `/`, falls back to the React SPA for other routes, and reverse-proxies `/api/` to the backend container.

### Why rsync + Docker for deployment?
Simple, no-CI deployment for early stage. `deploy.sh` syncs the repo to the droplet and rebuilds containers. Can be replaced with a proper CI/CD pipeline later.

### Database schema auto-creation
Tables are created via `Base.metadata.create_all` on startup. For production, switch to Alembic migrations (already in `requirements.txt` but not configured).

---

## Infrastructure

| Resource | Details |
|---|---|
| **Server** | DigitalOcean Droplet at `64.227.163.108` |
| **Domain** | `beta.26ritual.com` (points to droplet) |
| **SSL** | Let's Encrypt certificates mounted at `/etc/letsencrypt` |
| **Containers** | `bb-affiliate-postgres-prod`, `bb-affiliate-api-prod`, `bb-affiliate-ui-prod` |
| **DB Port (dev)** | Postgres exposed on `localhost:5434` for local tooling |
| **Nginx configs** | `nginx.conf` (dev), `nginx.prod.conf` (prod with SSL + ACME) |

---

## Known Issues & Tech Debt

1. **No Alembic migrations** — Schema changes are managed by SQLAlchemy auto-create, which won't handle column modifications or add columns to existing tables. New columns (e.g., `is_active` on `affiliate_links`, `account_status`/`approval_status`/`deleted_at` on `users`, `activity_logs` table) require a DB wipe on fresh builds (`docker compose down -v && docker compose up --build`) or manual `ALTER TABLE` statements. Set up Alembic before any schema changes in production.
2. **CORS configured via env var** — `CORS_ORIGINS` defaults to `http://localhost:5173` in dev, `https://beta.26ritual.com` in prod. Update if adding more domains.
3. **Default admin password** — `Admin@123` is hardcoded in `permissions.py`. Change on first deployment.
4. **No rate limiting** — Auth endpoints have no brute-force protection.
5. **No email verification** — Signups are immediately active without email confirmation.
6. **Product images** — Legacy brand carousel uses placeholder images in `public/images/`. Static landing page uses actual brand assets in `public/assets/brand/`.
7. **Google Sheets URL legacy** — The React landing page's `WaitlistForm.tsx` still submits to Google Apps Script. The static landing page (`landing.html`) now submits to `/api/public/waitlist` (DB-backed).
8. **No CI/CD** — Deployment is manual via `deploy.sh`. Consider GitHub Actions for automated builds/deploys.
9. **Dual landing page maintenance** — Two separate landing pages (static HTML at `/` and React at `/landing-page-1`) need to be kept in sync or one should be deprecated.

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

### Modifying the static landing page
1. Edit `frontend/public/landing.html` (structure)
2. Edit `frontend/public/css/styles.css` (styles)
3. Edit `frontend/public/js/main.js` (interactivity)
4. Add assets to `frontend/public/assets/` subdirectories
5. No build step required — changes are served directly by nginx

### Deploying changes
```bash
./deploy.sh
```
This rsyncs the project to the droplet and rebuilds all Docker containers.

### Running utility scripts
```bash
cd backend
python run_seed.py              # Re-run DB seed
python scripts/sync_now.py     # Force product sync from production DB
python count_products.py        # Count products in local DB
python get_products.py          # List all synced products
python wipe_products.py         # Clear local product catalog
```

---

## Contacts & Resources

| Resource | Link |
|---|---|
| GitHub Repo | https://github.com/Sach-in-dev/BB_Affilate |
| Live App | https://beta.26ritual.com |
| Server IP | 64.227.163.108 |
| BeautyBarn Storefront | https://beautybarn.in |
| Asset CDN | https://bb-asset.blr1.cdn.digitaloceanspaces.com |
| Design Reference | https://business.ikshvakusolutions.com/ |
