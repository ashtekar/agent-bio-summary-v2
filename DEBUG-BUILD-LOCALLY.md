# Debug Build Issues Locally

## Steps to Debug

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Minimal .env.local
Create `.env.local` with dummy values (just for TypeScript compilation):
```bash
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=dummy
OPENAI_API_KEY=dummy
RESEND_API_KEY=dummy
LANGCHAIN_API_KEY=dummy
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Type Check First
```bash
npx tsc --noEmit
```
This will show TypeScript errors without building.

### 4. Build
```bash
npm run build
```

### 5. Check for Specific Issues

#### If you see "Cannot find module" errors:
- Check if all imports use correct paths
- Verify `@/` alias is working (see `tsconfig.json`)

#### If you see type errors:
- Look for mismatched types between files
- Check optional properties (`?.` vs `.`)

#### If you see "Property does not exist" errors:
- Verify types match what's actually being returned
- Check if we removed properties that are still being accessed

## Files We Modified (Check These)

### New Files Created:
- ? `src/services/EvaluationService.ts` - Main service
- ? `src/app/api/evaluations/route.ts` - POST/GET evaluations
- ? `src/app/api/evaluations/next/route.ts` - Get next ungraded summary
- ? `src/app/api/summaries/[id]/route.ts` - Get single summary
- ? `src/app/grading/page.tsx` - Grading UI
- ? `src/app/evaluations/page.tsx` - Evaluations table view
- ? `docs/EVALUATIONS-DB-SCHEMA.md` - Database schema
- ? `docs/EVALUATIONS-SETUP.md` - Setup guide
- ? `docs/DROP-OLD-EVAL-COLUMNS.md` - Migration guide

### Modified Files:
- ? `src/services/SummaryStorageService.ts` - Removed human eval fields
- ? `src/types/agent.ts` - Removed human eval types
- ? `src/components/Navigation.tsx` - Added Evaluations tab
- ? `src/tools/EmailTools.ts` - Updated email links

## Common Issues We Fixed

1. ? Next.js 14 route params (not Promise-based)
2. ? Removed `SELECT *` queries (explicit columns)
3. ? Removed unused imports
4. ? Fixed dynamic imports

## What to Look For in Build Errors

1. **Import errors**: Check all `import` statements
2. **Type mismatches**: Check return types match interfaces
3. **Missing exports**: Ensure all exports are present
4. **Route handler issues**: Check Next.js 14 route syntax

## Get the Exact Error

Run this to capture full error output:
```bash
npm run build 2>&1 | tee build-error.log
```

Then share the error message from `build-error.log`.
