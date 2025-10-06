# Integration Testing Plan

## Current Environment Status

Based on `.env.local` analysis, all API keys are currently set to placeholder values:

```
🔑 API Key Status:
   OpenAI: ❌ Placeholder key (your_openai_api_key_here)
   Google Search: ❌ Placeholder keys (your_google_api_key_here)
   Supabase: ❌ Placeholder keys (your_supabase_url_here)
   Resend: ❌ Placeholder key (your_resend_api_key_here)
   Langchain: ❌ Placeholder key (your_langchain_api_key_here)
```

## Integration Testing Strategy

### Phase 1: Service-by-Service Testing (Recommended)

Test each external service individually to isolate issues:

#### 1.1 Google Custom Search API
```bash
# Test only Google Search
npm run test:integration -- --testNamePattern="Google Search"
```

**Requirements:**
- Get Google Custom Search API key from [Google Cloud Console](https://console.cloud.google.com/)
- Create a Custom Search Engine at [Google CSE](https://cse.google.com/)
- Update `.env.local`:
  ```
  GOOGLE_CUSTOM_SEARCH_API_KEY=your_actual_google_api_key
  GOOGLE_CUSTOM_SEARCH_ENGINE_ID=your_actual_engine_id
  ```

**Expected Result:** Real article search results

#### 1.2 Supabase Database
```bash
# Test only Supabase
npm run test:integration -- --testNamePattern="Supabase"
```

**Requirements:**
- Create Supabase project at [supabase.com](https://supabase.com)
- Get project URL and service role key from project settings
- Update `.env.local`:
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
  SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
  ```

**Expected Result:** Database connection and settings retrieval

#### 1.3 OpenAI API
```bash
# Test only OpenAI
npm run test:integration -- --testNamePattern="OpenAI"
```

**Requirements:**
- Get API key from [OpenAI Platform](https://platform.openai.com/)
- Update `.env.local`:
  ```
  OPENAI_API_KEY=sk-your_actual_openai_key
  ```

**Expected Result:** AI-generated article summaries

#### 1.4 Resend Email Service
```bash
# Test only Resend
npm run test:integration -- --testNamePattern="Resend"
```

**Requirements:**
- Get API key from [Resend](https://resend.com/)
- Update `.env.local`:
  ```
  RESEND_API_KEY=re_your_actual_resend_key  # or yre_ format
  ```

**Expected Result:** Email sending capability (test with safe addresses)

#### 1.5 Langchain Integration
```bash
# Test only Langchain
npm run test:integration -- --testNamePattern="Langchain"
```

**Requirements:**
- Get API key from [LangSmith](https://smith.langchain.com/)
- Update `.env.local`:
  ```
  LANGCHAIN_API_KEY=your_actual_langchain_key
  ```

**Expected Result:** Enhanced LLM tracing and operations

### Phase 2: End-to-End Integration

Once individual services work, test the complete workflow:

```bash
# Test full integration
npm run test:integration -- --testNamePattern="End-to-End"
```

### Phase 3: Performance & Reliability Testing

```bash
# Test performance and error handling
npm run test:integration -- --testNamePattern="Performance"
npm run test:integration -- --testNamePattern="Error Handling"
```

## Quick Start Guide

### Option 1: Minimal Testing (Recommended for Development)
Start with just the essential services:

1. **Google Search** - For article discovery
2. **OpenAI** - For summarization
3. **Supabase** - For data storage

### Option 2: Full Testing (Production Ready)
Set up all services for complete functionality:

1. All services from Option 1
2. **Resend** - For email delivery
3. **Langchain** - For advanced LLM operations

## Test Commands

```bash
# Run all integration tests
npm run test:integration

# Run specific service tests
npm run test:integration -- --testNamePattern="Google Search"
npm run test:integration -- --testNamePattern="Supabase"
npm run test:integration -- --testNamePattern="OpenAI"
npm run test:integration -- --testNamePattern="Resend"

# Run with verbose output
npm run test:integration -- --verbose

# Run only passing tests (skip failing ones)
npm run test:integration -- --passWithNoTests
```

## Environment Setup Checklist

- [ ] Google Custom Search API key and Engine ID
- [ ] Supabase project URL and service role key
- [ ] OpenAI API key
- [ ] Resend API key (optional)
- [ ] Langchain API key (optional)
- [ ] Update `.env.local` with real keys
- [ ] Test individual services
- [ ] Test end-to-end workflow

## Expected Costs

**Free Tiers Available:**
- Google Custom Search: 100 queries/day
- OpenAI: $5 credit for new accounts
- Supabase: 500MB database, 50MB storage
- Resend: 3,000 emails/month
- Langchain: Limited free usage

**Estimated Monthly Cost for Production:**
- Google Search: ~$5-10
- OpenAI: ~$20-50 (depending on usage)
- Supabase: ~$25 (Pro plan)
- Resend: ~$20 (Pro plan)
- **Total: ~$70-105/month**

## Troubleshooting

### Common Issues

1. **API Key Format Errors**
   - OpenAI keys start with `sk-`
   - Resend keys start with `re_` or `yre_`
   - Google keys are long alphanumeric strings

2. **Network/Connection Issues**
   - Check firewall settings
   - Verify API endpoints are accessible
   - Test with curl commands

3. **Rate Limiting**
   - Implement exponential backoff
   - Monitor API usage quotas
   - Use test data to avoid hitting limits

### Debug Commands

```bash
# Check environment variables
node -e "console.log(process.env.OPENAI_API_KEY)"

# Test API connectivity
curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models

# Run tests with debug output
npm run test:integration -- --verbose --no-coverage
```

## Next Steps

1. **Choose your testing approach** (minimal vs full)
2. **Set up API keys** for chosen services
3. **Run individual service tests** to verify connectivity
4. **Test end-to-end workflow** once all services work
5. **Monitor performance and costs** during testing
6. **Document any issues** and solutions found

## Integration Test Files

- `src/integration/__tests__/simple-integration.test.ts` - Basic connectivity tests
- `src/integration/__tests__/external-services.test.ts` - Full service integration
- `src/integration/__tests__/service-health.test.ts` - Health checks and validation
- `src/integration/__tests__/mock-vs-real.test.ts` - Mock accuracy validation
