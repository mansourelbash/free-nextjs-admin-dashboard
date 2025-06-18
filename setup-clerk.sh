#!/bin/bash
# Quick setup script for Clerk credentials

echo "🔑 CLERK SETUP REQUIRED 🔑"
echo ""
echo "1. Go to: https://dashboard.clerk.com"
echo "2. Create a new application"
echo "3. Get your API keys from the 'API Keys' section"
echo "4. Update .env.local with your actual keys:"
echo ""
echo "   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key"
echo "   CLERK_SECRET_KEY=sk_test_your_actual_key"
echo ""
echo "5. Run: npm run dev"
echo ""
echo "Your database is already configured with Neon PostgreSQL!"
