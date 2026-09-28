# Review Synthesizer - Micro-SaaS Boilerplate

A production-ready Micro-SaaS application that automatically synthesizes Shopify product reviews using Claude AI and sends summaries to Telegram.

## 🎯 Problem Statement

E-commerce store owners receive numerous customer reviews daily but often lack the time to analyze them all. This application automatically:
- Fetches product reviews from Shopify
- Synthesizes lengthy reviews into concise summaries using Claude AI
- Analyzes sentiment (positive/negative/neutral)
- Extracts key points
- Sends formatted summaries to Telegram for quick insights

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Review Synthesizer                   │
├─────────────────────────────────────────────────────────┤
│  Frontend: Next.js + React + Tailwind CSS              │
│  Backend: Next.js API Routes                           │
│  Database: PostgreSQL with Prisma ORM                  │
│  Auth: NextAuth.js with OAuth + Email                  │
│  Payments: Stripe                                       │
│  AI: Claude API (Anthropic)                            │
│  Notifications: Telegram Bot API                       │
└─────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
review-synthesizer/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/
│   │   ├── webhooks/stripe/
│   │   ├── shops/[storeId]/sync-reviews/
│   │   └── checkout/
│   ├── dashboard/
│   │   ├── page.tsx
│   │   └── shops/
│   ├── pricing/
│   │   └── page.tsx
│   ├── auth/
│   │   ├── signin/
│   │   └── signup/
│   ├── layout.tsx
│   └── page.tsx (landing page)
├── components/
│   ├── Header.tsx
│   ├── PricingCard.tsx
│   └── StoreCard.tsx
├── lib/
│   ├── prisma.ts
│   ├── auth-config.ts
│   ├── stripe.ts
│   └── services/
│       ├── shopify.ts
│       ├── telegram.ts
│       └── synthesis.ts
├── prisma/
│   └── schema.prisma
├── .env.example
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

## 🚀 Quick Start Installation

### Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database
- Stripe account
- Shopify app (or use their test store)
- Telegram bot token
- Claude API key (Anthropic)
- Git

### Step 1: Clone & Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd review-synthesizer

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

### Step 2: Database Setup

```bash
# Create PostgreSQL database
createdb review_synthesizer

# Update DATABASE_URL in .env.local
DATABASE_URL="postgresql://user:password@localhost:5432/review_synthesizer"

# Run Prisma migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

### Step 3: Configure Environment Variables

Edit `.env.local` with your credentials:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/review_synthesizer"

# NextAuth Configuration
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://localhost:3000"

# Stripe Keys
# Get from: https://dashboard.stripe.com/apikeys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Shopify (for testing)
# Create a custom app in your Shopify admin
NEXT_PUBLIC_SHOPIFY_API_VERSION="2024-01"

# Claude API
# Get from: https://console.anthropic.com
CLAUDE_API_KEY="sk-ant-..."

# Telegram Bot
# Create bot with @BotFather on Telegram
TELEGRAM_BOT_TOKEN="123456789:ABCDefGhIjKlMnOpQrStUvWxYz"

# OAuth Providers (optional but recommended)
GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="xxx"
GITHUB_ID="xxx"
GITHUB_SECRET="xxx"
```

#### Getting Your API Keys:

**Stripe:**
1. Sign up at https://stripe.com
2. Go to Dashboard → API Keys
3. Copy Publishable and Secret keys
4. Set up webhook endpoint at: `https://yourdomain.com/api/webhooks/stripe`

**Shopify:**
1. In Shopify Admin, go to Settings → Apps and integrations
2. Create a custom app with product_reviews scope

**Claude API:**
1. Visit https://console.anthropic.com
2. Create API key
3. Set up credits/billing

**Telegram Bot:**
1. Chat with @BotFather on Telegram
2. Create new bot with `/newbot`
3. Get your bot token
4. Find your chat ID by messaging the bot and visiting `https://api.telegram.org/bot<TOKEN>/getUpdates`

**Google OAuth (optional):**
1. Go to https://console.cloud.google.com
2. Create OAuth 2.0 credentials
3. Add `http://localhost:3000/api/auth/callback/google` as authorized redirect

### Step 4: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 5: Create Your First Account

1. Sign up at the landing page
2. Choose a pricing plan
3. Complete Stripe checkout (use test card: 4242 4242 4242 4242)
4. Connect your Shopify store in the dashboard

## 🔧 Configuration Guide

### Adding a Shopify Store

1. In Dashboard → "Add Shopify Store"
2. Enter store name (e.g., `mystore`)
3. Provide Shopify access token (from custom app)
4. Click "Connect"

### Setting Up Telegram Notifications

1. In Store Settings → Integrations
2. Click "Add Integration"
3. Select "Telegram"
4. Enter Bot Token and Chat ID
5. Click "Save"

### Syncing Reviews

Automatic:
- Reviews sync every 6 hours (configurable in cron job)

Manual:
- Dashboard → Select Store → "Sync Reviews"

## 📊 Database Schema

### Key Models:

**User**
- Authentication & subscription management
- Multiple shops per user

**ShopStore**
- Connected Shopify stores
- API credentials (encrypted)

**Review**
- Raw reviews from Shopify
- Product & customer info

**SynthesizedReview**
- AI-generated summaries
- Sentiment analysis
- Telegram delivery status

**Subscription**
- Stripe integration
- Plan tracking

**Integration**
- Third-party service configs
- Telegram, Slack, webhooks

## 🔐 Security Best Practices

✅ Implemented:
- Encrypted API keys in database
- JWT-based authentication
- CSRF protection with NextAuth
- Input validation on all endpoints
- Rate limiting ready (add Redis)
- SQL injection prevention via Prisma

⚠️ Todo for Production:
- Add rate limiter (Redis + middleware)
- Enable HTTPS only
- Add Content Security Policy headers
- Implement CORS properly
- Set up monitoring/logging (Sentry)
- Add audit logs for sensitive operations

## 💳 Stripe Integration

### Webhook Handling

The `/api/webhooks/stripe` endpoint handles:
- `customer.subscription.created` - New subscription
- `customer.subscription.updated` - Plan changes
- `customer.subscription.deleted` - Cancellation
- `invoice.payment_succeeded` - Payment received
- `invoice.payment_failed` - Payment failed

### Testing Webhooks Locally

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to localhost
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test webhook
stripe trigger customer.subscription.created
```

## 🧪 Testing

### Unit Tests (Setup with Jest)

```bash
npm install --save-dev jest @testing-library/react
npm run test
```

### E2E Tests (Setup with Playwright)

```bash
npm install --save-dev @playwright/test
npx playwright install
npx playwright test
```

### Manual Testing Checklist:

- [ ] User signup/login works
- [ ] Can connect Shopify store
- [ ] Reviews sync correctly
- [ ] AI synthesis works
- [ ] Telegram messages send
- [ ] Stripe payments process
- [ ] Subscription limits enforced
- [ ] Mobile responsive

## 📈 Performance Optimization

### Already Implemented:
- Database indexing (Prisma)
- Query optimization
- API response caching headers
- Image optimization via Next.js
- CSS minification (Tailwind)

### Recommended Additions:
- Add Redis for caching
- Implement queue system (Bull/RabbitMQ) for synthesis
- Use CDN for static assets
- Database read replicas
- API rate limiting

## 🚢 Deployment

### Deploy to Vercel (Recommended for Next.js)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Redeploy after env changes
```

### Deploy to Other Platforms

**AWS:**
```bash
# Use Amplify, EC2, or ECS
amplify init
amplify push
```

**Docker:**
```bash
# Create Dockerfile
docker build -t review-synthesizer .
docker run -p 3000:3000 review-synthesizer
```

**Railway/Render:**
- Connect GitHub repo
- Set environment variables
- Deploy button

## 📚 API Reference

### Authentication Endpoints

```
POST /api/auth/signup
POST /api/auth/signin
POST /api/auth/signout
GET  /api/auth/session
```

### Shop Endpoints

```
GET  /api/shops
POST /api/shops
GET  /api/shops/[id]
PUT  /api/shops/[id]
POST /api/shops/[id]/sync-reviews
```

### Subscription Endpoints

```
GET  /api/subscription
POST /api/checkout
POST /api/webhooks/stripe
```

## 🐛 Troubleshooting

### "Database connection failed"
- Verify PostgreSQL is running: `psql -U postgres`
- Check DATABASE_URL is correct
- Run: `npx prisma db push`

### "Shopify API error"
- Verify access token is valid
- Check Shopify app has correct scopes
- Wait a few minutes for token activation

### "Telegram messages not sending"
- Verify bot token is correct
- Check bot has permission to message chat
- Ensure chat_id is numeric

### "Stripe webhook not triggering"
- Verify webhook secret is correct
- Check webhook URL is accessible
- Use Stripe CLI to test locally

### "Claude synthesis failing"
- Verify API key is correct and has credits
- Check rate limits
- Ensure input content is valid

## 📖 Additional Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs/)
- [NextAuth.js Docs](https://next-auth.js.org/)
- [Stripe API Docs](https://stripe.com/docs/api)
- [Shopify Admin API](https://shopify.dev/docs/admin-api)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Claude API](https://docs.anthropic.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🎓 Maintenance & Support

### Regular Maintenance Tasks:

- [ ] Update dependencies monthly: `npm update`
- [ ] Check security: `npm audit`
- [ ] Monitor Stripe webhooks
- [ ] Backup database weekly
- [ ] Review API logs for errors
- [ ] Monitor costs (Claude, Stripe)

### Common Commands:

```bash
# Check dependencies
npm outdated

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update

# Clean cache
npm cache clean --force

# Reinstall modules
rm -rf node_modules && npm install
```

## 💡 Feature Ideas for Enhancement

- [ ] Slack integration
- [ ] Discord webhook support
- [ ] Email notifications
- [ ] Review analytics dashboard
- [ ] Custom synthesis prompts
- [ ] Multi-language support
- [ ] Scheduled reports
- [ ] Review response generation
- [ ] Competitor analysis
- [ ] Mobile app (React Native)

---

**Built with ❤️ using Next.js, Stripe, and Claude AI**

For questions or support, create an issue on GitHub or email: support@reviewsynthesizer.com
