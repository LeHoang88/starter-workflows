#!/bin/bash

# Review Synthesizer - Setup Script
# This script automates the initial setup of the project

set -e

echo "🚀 Review Synthesizer - Setup Script"
echo "======================================"
echo ""

# Check Node.js
echo "✓ Checking Node.js version..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ is required. Current version: $(node -v)"
    exit 1
fi
echo "✓ Node.js $(node -v) is installed"
echo ""

# Check PostgreSQL
echo "✓ Checking PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL is not installed. Install it first:"
    echo "   macOS: brew install postgresql"
    echo "   Linux: sudo apt-get install postgresql"
    echo "   Windows: Download from https://www.postgresql.org/download/"
    exit 1
fi
echo "✓ PostgreSQL is installed"
echo ""

# Create .env.local
echo "📝 Setting up environment variables..."
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo "✓ Created .env.local from .env.example"
    echo ""
    echo "⚠️  Please edit .env.local with your configuration:"
    echo "   - DATABASE_URL (PostgreSQL connection)"
    echo "   - STRIPE keys (from https://dashboard.stripe.com)"
    echo "   - Claude API key (from https://console.anthropic.com)"
    echo "   - Telegram bot token (from @BotFather)"
    echo "   - OAuth credentials (optional)"
    echo ""
    read -p "Press Enter once you've configured .env.local..."
else
    echo "✓ .env.local already exists"
fi
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✓ Dependencies installed"
echo ""

# Create database
echo "🗄️  Setting up database..."
echo "Please enter your PostgreSQL credentials:"
read -p "PostgreSQL User (default: postgres): " DB_USER
DB_USER=${DB_USER:-postgres}
read -sp "PostgreSQL Password: " DB_PASSWORD
echo ""

# Update DATABASE_URL in .env.local
DB_NAME="review_synthesizer"
DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"

# Create database
PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
    PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -c "CREATE DATABASE $DB_NAME;"

echo "✓ Database '$DB_NAME' created"
echo ""

# Update .env.local with database URL
sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=\"$DATABASE_URL\"|g" .env.local
rm .env.local.bak 2>/dev/null || true

# Run Prisma migrations
echo "🔄 Running database migrations..."
npx prisma migrate dev --name init
echo "✓ Database migrations completed"
echo ""

# Generate NextAuth secret
echo "🔐 Generating NextAuth secret..."
NEXTAUTH_SECRET=$(openssl rand -base64 32)
sed -i.bak "s|NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=\"$NEXTAUTH_SECRET\"|g" .env.local
rm .env.local.bak 2>/dev/null || true
echo "✓ NextAuth secret generated"
echo ""

# Summary
echo "✅ Setup Complete!"
echo ""
echo "📚 Next Steps:"
echo "1. Update remaining configuration in .env.local:"
echo "   - STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY"
echo "   - CLAUDE_API_KEY"
echo "   - TELEGRAM_BOT_TOKEN"
echo "   - OAuth provider credentials (optional)"
echo ""
echo "2. Start development server:"
echo "   npm run dev"
echo ""
echo "3. Open browser:"
echo "   http://localhost:3000"
echo ""
echo "📖 Documentation: See README.md for detailed setup instructions"
echo ""
