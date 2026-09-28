# Project Structure & File Guide

## Complete Directory Structure

```
review-synthesizer/
│
├── app/                              # Next.js App Router directory
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/route.ts  # NextAuth authentication endpoints
│   │   ├── webhooks/
│   │   │   └── stripe/route.ts       # Stripe webhook handler
│   │   ├── shops/
│   │   │   ├── route.ts              # List/create shops
│   │   │   └── [storeId]/
│   │   │       ├── route.ts          # Get/update shop
│   │   │       └── sync-reviews/route.ts  # Sync reviews from Shopify
│   │   ├── checkout/route.ts         # Stripe checkout session creation
│   │   └── health/route.ts           # Health check endpoint
│   │
│   ├── dashboard/                    # Protected dashboard pages
│   │   ├── page.tsx                  # Main dashboard view
│   │   ├── layout.tsx                # Dashboard layout
│   │   └── shops/
│   │       ├── new/page.tsx          # Add new shop form
│   │       └── [id]/
│   │           ├── page.tsx          # Shop details & settings
│   │           ├── reviews/page.tsx  # Shop reviews list
│   │           └── integrations/page.tsx  # Integration settings
│   │
│   ├── pricing/page.tsx              # Pricing page
│   ├── auth/
│   │   ├── signin/page.tsx           # Sign in page
│   │   ├── signup/page.tsx           # Sign up page
│   │   └── error/page.tsx            # Auth error page
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Landing page
│   └── globals.css                   # Global styles
│
├── components/                       # Reusable React components
│   ├── Header.tsx                    # Navigation header
│   ├── Footer.tsx                    # Footer
│   ├── PricingCard.tsx               # Pricing plan card
│   ├── StoreCard.tsx                 # Shop store display card
│   ├── ReviewSynthesisCard.tsx       # Synthesized review display
│   ├── Loader.tsx                    # Loading spinner
│   └── Button.tsx                    # Reusable button component
│
├── lib/                              # Utility functions & services
│   ├── prisma.ts                     # Prisma client singleton
│   ├── auth-config.ts                # NextAuth configuration
│   ├── stripe.ts                     # Stripe utilities & webhook handling
│   ├── constants.ts                  # App constants
│   ├── utils.ts                      # Helper functions
│   └── services/
│       ├── shopify.ts                # Shopify API integration
│       ├── telegram.ts               # Telegram bot integration
│       └── synthesis.ts              # Claude AI review synthesis
│
├── prisma/                           # Database schema & migrations
│   ├── schema.prisma                 # Database schema definition
│   ├── migrations/                   # Database migration history
│   └── seed.ts                       # Database seeding script
│
├── public/                           # Static files
│   ├── favicon.ico
│   ├── logo.svg
│   └── images/
│
├── styles/                           # Global styles
│   ├── globals.css                   # Tailwind imports & global styles
│   └── variables.css                 # CSS custom properties
│
├── types/                            # TypeScript type definitions
│   ├── index.ts                      # Exported types
│   ├── auth.ts                       # Auth-related types
│   └── api.ts                        # API response types
│
├── hooks/                            # Custom React hooks
│   ├── useAuth.ts                    # Authentication hook
│   ├── useShops.ts                   # Shops data hook
│   └── useStores.ts                  # Zustand store hooks
│
├── store/                            # Zustand state management
│   ├── authStore.ts                  # Auth state
│   └── uiStore.ts                    # UI state (notifications, etc)
│
├── .env.example                      # Environment variables template
├── .env.local                        # Local environment (git ignored)
├── .gitignore                        # Git ignore rules
├── .eslintrc.json                    # ESLint configuration
├── tsconfig.json                     # TypeScript configuration
├── tailwind.config.js                # Tailwind CSS configuration
├── postcss.config.js                 # PostCSS configuration
├── next.config.js                    # Next.js configuration
├── middleware.ts                     # NextAuth middleware
│
├── Dockerfile                        # Docker container definition
├── docker-compose.yml                # Docker Compose for local dev
├── setup.sh                          # Automated setup script
│
├── package.json                      # NPM dependencies & scripts
├── package-lock.json                 # Dependency lock file
│
├── README.md                         # Main documentation
├── STRUCTURE.md                      # This file
├── CONTRIBUTING.md                   # Contribution guidelines
└── LICENSE                           # MIT License
```

## Key Files Explanation

### Core Application Files

| File | Purpose |
|------|---------|
| `app/layout.tsx` | Root layout wrapping all pages with providers (Auth, Toast, etc) |
| `app/page.tsx` | Landing page showcasing product features |
| `middleware.ts` | NextAuth middleware protecting routes and managing auth state |

### Database

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Complete database schema with all models |
| `prisma/migrations/` | Database version history (auto-generated) |

### Authentication

| File | Purpose |
|------|---------|
| `lib/auth-config.ts` | NextAuth setup with OAuth & credentials providers |
| `app/api/auth/[...nextauth]/route.ts` | NextAuth API route handler |
| `app/auth/signin/page.tsx` | Sign in UI |
| `app/auth/signup/page.tsx` | Sign up UI |

### Integrations

| File | Purpose |
|------|---------|
| `lib/stripe.ts` | Stripe client, webhook handling, payment logic |
| `lib/services/shopify.ts` | Shopify API client for fetching reviews |
| `lib/services/telegram.ts` | Telegram bot for sending notifications |
| `lib/services/synthesis.ts` | Claude AI integration for review synthesis |

### API Routes

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/*` | `POST` | NextAuth authentication |
| `/api/webhooks/stripe` | `POST` | Stripe event handling |
| `/api/shops` | `GET/POST` | List/create user shops |
| `/api/shops/[id]` | `GET/PUT` | Shop details & updates |
| `/api/shops/[id]/sync-reviews` | `POST` | Trigger review sync |
| `/api/checkout` | `POST` | Create checkout session |

### Frontend Pages

| Page | Route | Purpose |
|------|-------|---------|
| Landing | `/` | Product overview & signup CTA |
| Pricing | `/pricing` | Plans & pricing comparison |
| Dashboard | `/dashboard` | Main app, shop overview |
| Shop Settings | `/dashboard/shops/[id]` | Configure individual shop |
| Add Shop | `/dashboard/shops/new` | Connect new Shopify store |
| Sign In | `/auth/signin` | User login |
| Sign Up | `/auth/signup` | User registration |

### Services (Business Logic)

#### Shopify Service
- **Location**: `lib/services/shopify.ts`
- **Responsibility**: Fetch reviews from Shopify, sync to database
- **Key Methods**:
  - `fetchReviews()` - Get reviews from Shopify GraphQL API
  - `syncReviews()` - Store reviews in PostgreSQL

#### Telegram Service
- **Location**: `lib/services/telegram.ts`
- **Responsibility**: Send formatted messages to Telegram
- **Key Methods**:
  - `sendReviewSynthesis()` - Post synthesis to chat
  - `deleteMessage()` - Remove sent message
  - `formatMessage()` - Create formatted Telegram HTML

#### Synthesis Service
- **Location**: `lib/services/synthesis.ts`
- **Responsibility**: Use Claude API to summarize reviews
- **Key Methods**:
  - `synthesizeReview()` - Call Claude API with review
  - `synthesizeReviewsForStore()` - Batch process unsynced reviews

### Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies, build scripts, project metadata |
| `tsconfig.json` | TypeScript compiler options |
| `tailwind.config.js` | Tailwind CSS theme customization |
| `next.config.js` | Next.js build & runtime configuration |
| `postcss.config.js` | CSS preprocessing configuration |
| `.env.example` | Template for environment variables |
| `.eslintrc.json` | Code linting rules |

### Docker Configuration

| File | Purpose |
|------|---------|
| `Dockerfile` | Production-ready container image |
| `docker-compose.yml` | Local development with PostgreSQL |

## Data Flow Architecture

### Review Sync Flow
```
Shopify Store
    ↓
[ShopifyService.syncReviews()]
    ↓
PostgreSQL (Review table)
    ↓
[SynthesisService.synthesizeReviewsForStore()]
    ↓
Claude AI (Synthesis)
    ↓
PostgreSQL (SynthesizedReview table)
    ↓
[TelegramService.sendReviewSynthesis()]
    ↓
Telegram Chat
```

### Payment Flow
```
User clicks "Get Started"
    ↓
[POST /api/checkout]
    ↓
Stripe Checkout Session
    ↓
User completes payment
    ↓
Stripe Webhook [POST /api/webhooks/stripe]
    ↓
Update Subscription in PostgreSQL
    ↓
Grant plan features
```

### Authentication Flow
```
User visits site
    ↓
[SignIn/SignUp Page]
    ↓
[NextAuth Provider]
    ↓
OAuth or Email/Password
    ↓
JWT Token stored in httpOnly cookie
    ↓
Middleware validates on protected routes
    ↓
Access granted to /dashboard
```

## State Management

### Zustand Stores
Located in `store/`:
- `authStore.ts` - User auth state
- `uiStore.ts` - Toast notifications, loading states

### API State
- React Query would be recommended addition for caching

## Styling Strategy

- **Framework**: Tailwind CSS
- **Custom CSS**: `app/globals.css` for global styles
- **Component Styles**: Inline Tailwind classes (utility-first)
- **Dark Mode**: Ready in tailwind.config.js

## Environment Variables

See `.env.example` for all required variables:
- Database connection
- Authentication secrets
- API keys (Stripe, Claude, Telegram)
- Third-party OAuth credentials

## Testing Structure (To Implement)

```
__tests__/
├── unit/
│   ├── services/
│   │   ├── shopify.test.ts
│   │   ├── telegram.test.ts
│   │   └── synthesis.test.ts
│   └── lib/
│       └── stripe.test.ts
│
└── e2e/
    ├── auth.spec.ts
    ├── dashboard.spec.ts
    └── payment.spec.ts
```

## Performance Considerations

- **Database Indexes**: Defined in schema.prisma
- **API Caching**: Headers in next.config.js
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic via Next.js
- **Bundle Size**: Check with `npm run build`

## Security Considerations

- Credentials never in frontend code
- API keys in .env.local (git ignored)
- Database encryption ready
- CSRF protection via NextAuth
- SQL injection prevention via Prisma ORM
- Rate limiting ready (add Redis)

---

For questions about specific files, refer to inline code comments or README.md.
