# Book Marketplace Frontend

React and TypeScript client for the NestJS/MongoDB book marketplace API. Customer, seller, and administrator screens use the live backend at `http://localhost:3000/api/v1` by default; JSON Server is not used.

## Requirements

- Node.js 20.19 or newer (`nvm use` reads the included `.nvmrc`)
- The sibling backend project at `../bookmarketplace -backend`
- A reachable MongoDB instance configured by the backend

## Run locally

```bash
nvm use
npm install
npm run dev
```

To start the frontend and backend together from this directory:

```bash
npm run dev:all
```

The frontend runs at `http://localhost:5173`. Set `VITE_API_BASE_URL` when the API is hosted somewhere other than `http://localhost:3000/api/v1`.

## Build and verify

```bash
npm run build
npm run lint
```

## Live modules

- Customer catalog, seller comparison, cart, checkout, orders, profile, and password changes
- Seller approval state, dashboard, book requests, listings, inventory, orders, and profile
- Admin dashboard, seller/book/customer management, catalog editing, impersonation, and profile
- Email verification, password reset, token refresh, categories, book images, and newsletter subscriptions

All API responses are normalized in `src/api`, while TanStack Query hooks in `src/hooks` own fetching, mutations, caching, and invalidation.
