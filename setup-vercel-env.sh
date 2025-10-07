#!/bin/bash

# Vercel Environment Variables Setup Script
# Run this script to set up all required environment variables for agent-bio-summary-v2

echo "🚀 Setting up Vercel environment variables for agent-bio-summary-v2"
echo "You'll need to provide the actual values from your .env.local file"
echo ""

# Langchain Configuration
echo "📝 Adding Langchain configuration..."
npx vercel env add LANGCHAIN_API_KEY
npx vercel env add LANGCHAIN_TRACING_V2
npx vercel env add LANGCHAIN_PROJECT
npx vercel env add LANGCHAIN_CALLBACKS_BACKGROUND

echo ""
echo "🔗 Adding Supabase configuration..."
npx vercel env add NEXT_PUBLIC_SUPABASE_URL
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
npx vercel env add SUPABASE_SERVICE_ROLE_KEY

echo ""
echo "🤖 Adding OpenAI configuration..."
npx vercel env add OPENAI_API_KEY

echo ""
echo "📧 Adding Resend email configuration..."
npx vercel env add RESEND_API_KEY

echo ""
echo "🔍 Adding Google Custom Search configuration..."
npx vercel env add GOOGLE_CUSTOM_SEARCH_API_KEY
npx vercel env add GOOGLE_CUSTOM_SEARCH_ENGINE_ID

echo ""
echo "🌐 Adding application configuration..."
npx vercel env add NEXT_PUBLIC_BASE_URL

echo ""
echo "✅ Environment variables setup complete!"
echo "Run 'npx vercel env ls' to verify all variables are set"

