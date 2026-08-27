# SEPGATE

SEPGATE is a Stellar anchor compliance monitor. It runs automated checks against anchors to verify their implementation of Stellar Enhancement Proposals (SEPs) — specifically SEP-1, SEP-6, SEP-10, SEP-24, and SEP-38.

## Features

- **Free public directory**: Browse monitored anchors and their compliance status.
- **Scheduled checks**: Automated SEP compliance verification runs every 15 minutes (configurable).
- **On-demand paid checks**: Fresh compliance checks via x402 micropayment (Stellar testnet).
- **Operator dashboard**: Claim anchors, configure email/webhook alerts, manage domain verification.
- **Admin console**: Monitor all anchors and users, manage pricing and platform settings.

## Development

### Prerequisites

- Node.js 20+
- pnpm 10+
- PostgreSQL (or embedded PGlite for local dev)

### Setup

```bash
pnpm install
```

### Environment

Copy `.env.example` files to `.env.local` in each app:

- `apps/api/.env.local` — database, SMTP, x402, Stellar settings
- `apps/web/.env.local` — API URL, session secret, internal API secret

Generate a session secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Running locally

```bash
# Terminal 1: API
pnpm --filter @sepgate/api dev

# Terminal 2: Web
pnpm --filter @sepgate/web dev
```

API: `http://localhost:4000`  
Web: `http://localhost:3000`

### Database

```bash
pnpm db:migrate    # Run migrations
pnpm db:seed       # Seed 3 testnet anchors
pnpm db:generate   # Regenerate Drizzle types
```

### Testing

```bash
pnpm test          # Run all tests
pnpm lint          # Lint all apps
pnpm typecheck     # TypeScript check all apps
```

## Deployment

Apps are configured for:

- **Web**: Vercel (Next.js)
- **API + Postgres**: Render (Node.js + managed database)

See deploy configs for environment variables and setup.

## Architecture

- **apps/api**: Express + TypeScript, Stellar SDK, Drizzle ORM, PostgreSQL
- **apps/web**: Next.js 15 App Router, React 18, Tailwind CSS, iron-session
- **Database**: PostgreSQL with Drizzle migrations
- **Auth**: Session cookies (web), shared internal secret (server-to-server)
- **Payments**: x402 (Stellar testnet) for on-demand checks

## License

Proprietary.
