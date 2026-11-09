# Rideshare Admin Panel

An admin dashboard for a ride-hailing and carpool platform, built with React 18, Vite and Tailwind CSS.

> This is a practice and portfolio project. "Example Rides", the logo, contact details and the legal page text are placeholders, and the project is not affiliated with any real company. The backend API is not included.

## Features

- Dashboard with growth, activity, revenue and ride-outcome metrics
- Rider and driver management, suspensions and rewarded-balance history
- Driver onboarding with document and vehicle review
- Vehicle categories, ride rates, city pricing and peak windows
- Private and carpool ride tracking, plus a live map view (Google Maps)
- Campaigns and promo codes, reports, push notifications and admin roles (RBAC)

## Tech stack

React 18 · Vite 6 · Tailwind CSS · React Router 6 · Axios · react-hook-form + zod · Recharts / Chart.js · Radix UI · Google Maps

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3001
```

### Environment variables

| Variable | Description |
| --- | --- |
| `VITE_BASE_URL` | Backend base URL. The app calls `${VITE_BASE_URL}/api/admin/`. Defaults to `http://localhost:8080`. |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps JavaScript API key, used by the live map and ride timelines. |
| `VITE_STRIPE_PUBLIC_KEY` | Optional Stripe publishable key. |

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm run test:dashboard` | Unit tests for the dashboard metrics |
| `npm run test:dashboard:browser` | Playwright tests against mocked API fixtures |

## Project docs

- [`PROJECT_DOCUMENTATION.md`](PROJECT_DOCUMENTATION.md): architecture, modules and conventions
- [`city-based-pricing-api.md`](city-based-pricing-api.md): the pricing API contract the panel expects
