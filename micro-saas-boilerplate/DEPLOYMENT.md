# Deployment Guide

Complete guide to deploy Review Synthesizer to production.

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database backups created
- [ ] Stripe webhook URL configured
- [ ] HTTPS certificate ready
- [ ] Domain name registered & configured
- [ ] Email service configured
- [ ] Monitoring setup (Sentry, DataDog, etc)
- [ ] SSL certificate installed
- [ ] Rate limiting configured

## Deployment Platforms

### 1. Vercel (Recommended for Next.js)

**Pros**: Easiest for Next.js, automatic deployments, built-in observability

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables
vercel env add DATABASE_URL
vercel env add STRIPE_SECRET_KEY
vercel env add NEXTAUTH_SECRET
# ... add all vars from .env.example

# Trigger deployment
vercel --prod
```

**Set up PostgreSQL on Vercel:**
1. Use AWS RDS, Supabase, or Railway
2. Get connection string
3. Set `DATABASE_URL` env var

**Configure Stripe Webhook:**
1. Go to Stripe Dashboard
2. Webhooks → Add endpoint
3. URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select: `customer.subscription.*`, `invoice.*`
5. Copy webhook secret → `STRIPE_WEBHOOK_SECRET`

### 2. Railway

**Pros**: Simple, free tier available, good for PostgreSQL

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# Set environment variables
railway variables set NEXTAUTH_SECRET="$(openssl rand -base64 32)"
railway variables set DATABASE_URL="postgresql://..."
# ... add all vars

# Deploy
railway up
```

**Deploy PostgreSQL:**
```bash
# Railway auto-provisions PostgreSQL
# Get connection string from Railway dashboard
# Set as DATABASE_URL environment variable
```

### 3. AWS (EC2 / ECS)

**Pros**: Scalable, enterprise-ready, complex setup

```bash
# Using AWS Amplify (easier)
npm install -g @aws-amplify/cli

# Initialize
amplify init

# Add hosting
amplify add hosting

# Deploy
amplify publish
```

**Using Docker on EC2:**
```bash
# Build image
docker build -t review-synthesizer .

# Tag for AWS ECR
docker tag review-synthesizer:latest \
  123456789.dkr.ecr.us-east-1.amazonaws.com/review-synthesizer:latest

# Push to ECR
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/review-synthesizer:latest

# Deploy on ECS
# Use AWS Console or CLI to create task definition and service
```

### 4. Render

**Pros**: Easy Docker deployment, free tier

```bash
# 1. Push code to GitHub
# 2. Go to render.com
# 3. Create new Web Service
# 4. Connect GitHub repo
# 5. Set environment variables:
#    - Runtime: Node
#    - Build: npm install && npm run build
#    - Start: npm start
# 6. Deploy
```

### 5. DigitalOcean App Platform

```bash
# Using doctl CLI
doctl auth init

# Create from doctl.yaml or via console
# Configure Docker container
# Set environment variables
# Deploy
```

## Production Environment Setup

### Database (PostgreSQL)

**Option A: Managed Service (Recommended)**
- AWS RDS
- Railway PostgreSQL
- Supabase
- DigitalOcean Managed Database

**Option B: Self-Hosted**
```bash
# SSH into server
ssh admin@your-server.com

# Install PostgreSQL
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Create database
sudo -u postgres psql
CREATE DATABASE review_synthesizer;
CREATE USER app_user WITH PASSWORD 'strong_password';
ALTER ROLE app_user SET client_encoding TO 'utf8';
ALTER ROLE app_user SET default_transaction_isolation TO 'read committed';
GRANT ALL PRIVILEGES ON DATABASE review_synthesizer TO app_user;
\q

# Backup setup
sudo -u postgres pg_dump review_synthesizer > backup.sql
# Schedule with cron
```

### Environment Variables

```bash
# Production .env
DATABASE_URL="postgresql://user:pass@host:5432/review_synthesizer"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NODE_ENV="production"

# Stripe (get from dashboard)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Claude API
CLAUDE_API_KEY="sk-ant-..."

# Telegram
TELEGRAM_BOT_TOKEN="123456789:ABC..."

# Email (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="noreply@yourdomain.com"
SMTP_PASSWORD="app_specific_password"
```

### SSL/HTTPS

**Automatic (Vercel/Railway)**
- HTTPS included automatically
- Let's Encrypt managed

**Manual (Self-hosted)**
```bash
# Using Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --nginx -d yourdomain.com

# Configure Nginx/Apache to use cert
# Auto-renewal
sudo systemctl enable certbot.timer
```

### Performance Optimization

**Database Optimization:**
```sql
-- Add indexes (already in schema.prisma)
CREATE INDEX idx_review_shop ON review(shopStoreId);
CREATE INDEX idx_synthesis_shop ON synthesizedReview(shopStoreId);
CREATE INDEX idx_user_email ON "user"(email);

-- Vacuum and analyze
VACUUM ANALYZE;
```

**Application Optimization:**
- Enable compression (gzip)
- Cache static assets (CDN)
- Database connection pooling
- API rate limiting

**Redis for Caching (Optional)**
```bash
# Deploy Redis
docker run -d -p 6379:6379 redis:7-alpine

# Add to .env
REDIS_URL="redis://localhost:6379"

# Update code to use Redis for caching
```

## Monitoring & Logging

### Error Tracking (Sentry)

```bash
# Install
npm install @sentry/nextjs

# Configure in next.config.js
# Get DSN from sentry.io
# Set SENTRY_DSN env var
```

### Logging (Winston/Pino)

```bash
npm install pino pino-pretty

# Logs sent to:
# - Console (dev)
# - File (production)
# - Service (Datadog, LogRocket, etc)
```

### Performance Monitoring

```bash
# Web Vitals
npm install web-vitals

# Configure in app/layout.tsx
# Send metrics to Vercel Analytics or your service
```

### Database Monitoring

```bash
# Use Prisma Studio in production (with security)
# Or use native PostgreSQL monitoring:
SELECT * FROM pg_stat_statements;
```

## Security Hardening

### Application Security

```javascript
// Add to next.config.js security headers
const securityHeaders = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains'
  }
]
```

### Database Security

- Enable SSL for database connections
- Use strong passwords
- Encrypt sensitive data
- Regular backups
- Access control (firewall rules)

### API Security

- Rate limiting
- Input validation
- CORS configuration
- API key rotation
- IP whitelisting (if applicable)

## Backup & Recovery

### Database Backups

```bash
# Manual backup
pg_dump -h host -U user review_synthesizer > backup_$(date +%Y%m%d).sql

# Automated (cron)
0 2 * * * pg_dump -h host -U user review_synthesizer | gzip > /backups/db_$(date +\%Y\%m\%d).sql.gz

# Restore
psql -h host -U user review_synthesizer < backup.sql
```

### Application Backups

- Git repo is source control
- Deploy scripts automated
- Configuration versioned

## Scaling

### Horizontal Scaling

**Database Read Replicas:**
```sql
-- AWS RDS, Azure, etc provide automatic read replicas
-- Configure Prisma for read/write splitting
```

**Application Servers:**
- Vercel: Automatic
- Self-hosted: Use load balancer (nginx, HAProxy)
- Docker: Kubernetes orchestration

### Vertical Scaling

- Increase database CPU/RAM
- Increase application memory
- Use faster servers

### Caching Strategy

```typescript
// API response caching
export const revalidate = 60 // 1 minute

// Data caching
const reviews = await prisma.review.findMany()
// Cache in Redis or use ISR
```

## CI/CD Pipeline

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - run: npm run test
      
      - name: Deploy
        run: vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

## Post-Deployment

### Health Checks

```bash
# Check application
curl https://yourdomain.com/api/health

# Check database connection
curl https://yourdomain.com/api/health

# Monitor Stripe webhooks
stripe events list
```

### Testing

```bash
# Full regression test
npm run test:e2e

# Load testing
npm install -g loadtest
loadtest -n 1000 https://yourdomain.com
```

### User Communication

- Send announcement email
- Update status page
- Blog post about new features
- Social media announcement

## Troubleshooting

### Application Issues

**500 Error:**
- Check server logs
- Verify database connection
- Check API key validity

**Memory Issues:**
- Check Node process memory
- Enable heap snapshots
- Optimize database queries

**Slow Performance:**
- Check database query logs
- Review API latency
- Check Claude API rate limits

### Database Issues

**Connection Refused:**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check connection
psql -h host -U user -d database
```

**Out of Disk Space:**
```bash
# Clean old backups
rm /backups/db_2023*.sql.gz

# Vacuum database
VACUUM;
```

## Rollback Plan

```bash
# If deployment fails
vercel rollback

# Manual rollback
git checkout previous_version
npm run build
vercel --prod
```

## Maintenance Schedule

- **Daily**: Monitor logs, check alerts
- **Weekly**: Performance review, security patches
- **Monthly**: Dependency updates, feature releases
- **Quarterly**: Security audit, capacity planning

---

For specific platform documentation:
- Vercel: https://vercel.com/docs
- Railway: https://docs.railway.app
- AWS: https://docs.aws.amazon.com
- PostgreSQL: https://www.postgresql.org/docs
