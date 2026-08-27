# SEPGATE Deployment Guide

## Overview

SEPGATE is deployed as:
- **Web**: Next.js app on Vercel
- **API**: Node.js Express server on Render
- **Database**: PostgreSQL on Render

This guide documents the infrastructure setup (configurations prepared, no live deployment executed).

## Prerequisites

### Required Accounts
- Vercel (for web app)
- Render (for API + Postgres)
- GitHub (repository)

### Required Secrets in GitHub
Set these in **Settings → Secrets and variables → Actions**:

```
VERCEL_TOKEN              # Vercel API token
VERCEL_ORG_ID             # Vercel organization ID
VERCEL_PROJECT_ID_WEB     # Vercel project ID for web app

RENDER_API_KEY            # Render API key
RENDER_SERVICE_ID_API     # Render service ID for API
```

## Environment Variables

### Web App (Vercel)
Set in Vercel project settings:

```
API_URL                   # Internal API URL (e.g., https://sepgate-api.onrender.com)
INTERNAL_API_SECRET       # Shared secret (min 32 chars)
SESSION_SECRET            # Session encryption (min 32 chars)
```

### API (Render)
Set in Render environment variables:

```
NODE_ENV=production
PORT=4000
DATABASE_URL              # Postgres connection string (auto-populated)
INTERNAL_API_SECRET       # Must match web app
SESSION_SECRET            # Must match web app
STELLAR_PAYTO_ADDRESS     # Stellar receiving address (optional, seeded if missing)
```

### Database (Render PostgreSQL)
- **Database**: sepgate_production
- **Connection**: Automatically provided to API service

## Deployment Configuration Files

### vercel.json
Configures web app deployment:
- Build command: `pnpm install && pnpm run build --filter @sepgate/web`
- Start command: `pnpm start --filter @sepgate/web`
- Routes all traffic to Next.js app

### render.yaml
Configures API and database:
- API service with pnpm monorepo build
- Postgres 16 starter database
- Auto-linking of DATABASE_URL to API

### .github/workflows/deploy.yml
GitHub Actions workflow:
1. Run tests (typecheck, lint, test)
2. Deploy web to Vercel
3. Deploy API to Render
4. Notify on completion

## Manual Deployment Steps

### Initial Setup

1. **Vercel Setup**
   ```bash
   # Connect GitHub repo to Vercel
   # Configure environment variables (see above)
   # Set root directory to "apps/web"
   ```

2. **Render Setup**
   ```bash
   # Create PostgreSQL database
   # Create Node service
   # Link to GitHub repo
   # Set root directory to "apps/api"
   ```

3. **GitHub Setup**
   ```bash
   # Add deployment secrets (see Prerequisites)
   # Trigger workflow on push to main
   ```

### Deploying a Change

Once configured, deployment is automatic on push to `main`:

```bash
git push origin main
```

The GitHub Actions workflow will:
1. Run all tests
2. Deploy web to Vercel
3. Deploy API to Render
4. Report status

### Rollback

To rollback a deployment:

1. **Revert the commit**:
   ```bash
   git revert <commit-sha>
   git push origin main
   ```

2. The GitHub Actions workflow will re-deploy the previous version.

## Production Checklist

Before going live:

- [ ] Verify SESSION_SECRET is 32+ random characters
- [ ] Verify INTERNAL_API_SECRET is 32+ random characters
- [ ] Set STELLAR_PAYTO_ADDRESS to a real Stellar keypair
- [ ] Configure ADMIN_EMAILS to grant admin access
- [ ] Test login/signup flow
- [ ] Test operator dashboard
- [ ] Test x402 payment endpoints
- [ ] Set up alert email configuration (nodemailer)
- [ ] Configure database backups on Render
- [ ] Set up monitoring/error tracking (optional)

## Monitoring

### Render
- API logs: Dashboard → Service → Logs
- Database logs: Dashboard → Database → Logs
- Metrics: Dashboard → Service → Metrics

### Vercel
- Web logs: Dashboard → Deployments → Logs
- Analytics: Dashboard → Analytics

## Troubleshooting

### API won't start
- Check DATABASE_URL is set in Render environment
- Verify migrations ran: `pnpm run db:migrate --filter @sepgate/api`
- Check logs in Render dashboard

### Web can't reach API
- Verify API_URL is correct in Vercel
- Check INTERNAL_API_SECRET matches on both sides
- Verify API service is running

### Database connection errors
- Verify DATABASE_URL syntax
- Check PostgreSQL service is running on Render
- Verify network connectivity

## Support

For deployment issues:
1. Check GitHub Actions workflow logs
2. Review service logs in Render/Vercel dashboards
3. Verify environment variables are set correctly
4. Check database connectivity from API service

## Next Steps (Prompt No. 2)

Future deployment improvements:
- Add database backup automation
- Set up error tracking (Sentry)
- Configure CDN for static assets
- Add performance monitoring
- Implement auto-scaling policies
