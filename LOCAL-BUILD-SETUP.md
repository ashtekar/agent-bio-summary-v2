# Local Build Setup Guide

## Quick Start

1. **Install dependencies** (if not already installed):
```bash
npm install
```

2. **Set up environment variables**:
```bash
cp env.example .env.local
# Edit .env.local with your actual API keys
```

For local builds, you can use dummy values for most variables since TypeScript compilation doesn't require actual API calls:

```bash
# Minimal .env.local for TypeScript compilation
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=dummy_key
SUPABASE_SERVICE_ROLE_KEY=dummy_key
OPENAI_API_KEY=dummy_key
RESEND_API_KEY=dummy_key
GOOGLE_CUSTOM_SEARCH_API_KEY=dummy_key
GOOGLE_CUSTOM_SEARCH_ENGINE_ID=dummy_key
LANGCHAIN_API_KEY=dummy_key
LANGCHAIN_TRACING_V2=false
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

3. **Run TypeScript type checking**:
```bash
npx tsc --noEmit
```

4. **Run the build**:
```bash
npm run build
```

## Common Build Errors & Fixes

### Type Errors
If you see type errors, they'll show the exact file and line. Common fixes:
- Check if imports are correct
- Verify types match between files
- Check for missing optional chaining (`?.`)

### Missing Dependencies
If you see "Cannot find module" errors:
```bash
npm install
```

### Environment Variable Errors
TypeScript won't catch these, but runtime will. For build testing, dummy values are fine.

## Troubleshooting

### Clear Cache and Rebuild
```bash
rm -rf .next node_modules
npm install
npm run build
```

### Check Specific Files
```bash
# Check a specific file
npx tsc --noEmit src/services/EvaluationService.ts

# Check all TypeScript files
npx tsc --noEmit
```

### View Detailed Build Output
```bash
npm run build 2>&1 | tee build-output.log
```

## Next Steps After Local Build Succeeds

1. Fix any TypeScript errors locally
2. Commit changes
3. Push to trigger Vercel build
4. Check Vercel logs if it still fails
