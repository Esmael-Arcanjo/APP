# WIBAZA Marketplace - PRD

## Original Problem Statement
Cloned two repos (Esmael-Arcanjo/Wibazaa frontend + Esmael-Arcanjo/BacWIbaza backend) and evolve them into an Amazon-style marketplace with:
- Full Admin (like Amazon): users/sellers management, bans/deletion, banners, announcements/ads, product approval, commissions release, stock overview, payments view, seller identity (name+email) on every product, category CRUD
- Full Seller Dashboard: product CRUD (with real image uploads), stock, orders, sales dashboard
- Full User: cart, checkout, orders history, reviews
- Discreet floating support chat: user↔vendor, user↔admin, admin↔anyone
- Add WIBAZA logo, keep existing folder structure
- Fully responsive for mobile (Amazon-like)
- Payment: Stripe (test keys provided)
- Auth: Google Login (prepared - keys to be added later)
- Language: kept as-is (PT/EN/ES support already there)
- Cloudinary + Resend + Stripe keys provided by user, wired into `backend/.env`

## Architecture
- Backend: FastAPI + Motor (Mongo), JWT auth (cookies), Stripe SDK, Resend, Cloudinary, WebSocket chat.
- Frontend: React 19 + Tailwind + Craco + Sonner + Framer Motion. Amazon-inspired teal+gold+navy theme.
- Deployment on kubernetes (supervisor). Ports: FE 3000, BE 8001 (all API prefixed with /api).

## What's Implemented (Feb 2026)
- Auth (JWT cookies) + Google OAuth endpoint prepared (needs GOOGLE_CLIENT_ID)
- Cloudinary uploads (single + multiple)
- Banner CRUD + public list
- Announcement/Ad CRUD + public feed + marquee display on Home
- Admin: bans/unban/delete users, all products view w/ seller info, stock overview, payments view, commissions generate+release
- Seller: product CRUD with Cloudinary image uploader
- Home: dynamic banners from DB (with default fallback), Amazon-style dark categories navbar
- Support chat widget (websocket)
- Stripe checkout + success/cancel pages + polling status
- Mobile-first: bottom nav, responsive tables, dark categories strip scrollable
- Logo integrated (public/logo-wibaza.jpg)

## Personas
1. Client (buyer): browse, search, cart, checkout, orders, chat support
2. Seller: publish/manage products with image upload, view orders, dashboard, chat
3. Admin: all-powerful control panel

## Backlog / Next
- P1: Ratings/reviews UI polish
- P1: Coupons/discounts
- P2: Shipping cost calculator
- P2: Real address book for user
- P2: Seller commission payout webhook (Stripe Connect)
- P2: PWA
