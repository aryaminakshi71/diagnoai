# DiagnoAI — Laboratory Information System

[![CI](https://github.com/aryaminakshi71/diagnoai/actions/workflows/ci.yml/badge.svg)](https://github.com/aryaminakshi71/diagnoai/actions/workflows/ci.yml)

A modern LIS for **human and veterinary** labs: patients, orders, samples, results, reports, invoices, inventory, and QC — with AI interpretation and PHI guardrails.

## AI features

- AI result interpretation (doctor-facing summary + abnormal explanations)
- AI abnormal-result explainer
- Patient-friendly report summaries
- PHI redaction before every model call
- One codebase for human and veterinary labs (`VITE_LAB_TYPE=human|veterinary|both`)

## Quick start

```bash
bun install
cp .env.example .env   # fill DATABASE_URL, BETTER_AUTH_SECRET, OPENAI_API_KEY
bun run dev            # web on :3000, API on :3101
```

## Tech Stack

- **Frontend**: TanStack Start (SSR + Client)
- **Backend**: oRPC (Type-safe APIs)
- **Database**: PostgreSQL + Drizzle ORM + Neon
- **Authentication**: Better Auth
- **State Management**: TanStack Query + @orpc/tanstack-query
- **Package Manager**: Bun

## Features

- ✅ 16 Register Types with Full CRUD
- ✅ Excel Import/Export
- ✅ Multi-tenant Organization Scoping
- ✅ Better Auth Authentication
- ✅ Dashboard with Statistics
- ✅ Type-safe APIs with oRPC
- ✅ Protected Routes

## Quick Start

### 1. Install Dependencies

```bash
bun install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and set:
- `DATABASE_URL` - Your PostgreSQL connection string
- `BETTER_AUTH_SECRET` - A random secret key
- `BETTER_AUTH_URL` - Your app URL (default: http://localhost:3000)

### 3. Set Up Database

```bash
# Generate migrations
bun run db:generate

# Push to database
bun run db:push
```

### 4. Start Development Server

```bash
bun run dev
```

The app will be available at `http://localhost:3000`

## Project Structure

```
saas-starter/
├── apps/
│   ├── api/          # Backend API (oRPC)
│   └── web/          # Frontend (TanStack Start)
├── packages/
│   ├── core/         # Shared core utilities
│   └── storage/      # Database schemas and connection
└── scripts/          # Setup scripts
```

## Register Types

1. Entry Register
2. OPD Register
3. Stock Register
4. Biochemistry Register
5. Brucella RBPT Register
6. Brucella Sero Surveillance Register
7. FMD Register
8. Bird Flu Register
9. AbSt Register
10. Daily Expenditure Register
11. PSKS Cashbook Register
12. PSKS Entry Register
13. Ledger Register
14. Dispatch Register
15. PSKS Ledger Register
16. PSKS Stock Register

## Development

### Type Checking

```bash
bun run typecheck
```

### Linting

```bash
bun run lint
```

### Database

```bash
# Generate migrations
bun run db:generate

# Push to database
bun run db:push

# Open Drizzle Studio
bun run --filter=storage db:studio
```

## Environment Variables

See `.env.example` for all available environment variables.

## License

Private - All rights reserved
