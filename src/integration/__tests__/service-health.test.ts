/**
 * Service Health Check Tests
 * 
 * These tests verify that external services are accessible and responding
 * without making expensive API calls.
 */

import { createClient } from '@supabase/supabase-js';

describe('External Service Health Checks', () => {
  const hasApiKeys = {
    openai: !!process.env.OPENAI_API_KEY,
    google: !!process.env.GOOGLE_CUSTOM_SEARCH_API_KEY && !!process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID,
    supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    resend: !!process.env.RESEND_API_KEY,
    langchain: !!process.env.LANGCHAIN_API_KEY,
  };

  describe('OpenAI Service Health', () => {
    it('should have valid API key format', () => {
      if (!hasApiKeys.openai) {
        console.warn('Skipping OpenAI health check - API key not configured');
        return;
      }

      const apiKey = process.env.OPENAI_API_KEY;
      expect(apiKey).toBeDefined();
      expect(apiKey).toMatch(/^sk-/); // OpenAI API keys start with 'sk-'
      expect(apiKey.length).toBeGreaterThan(20);

      console.log('✅ OpenAI API key format is valid');
    });

    it('should be able to make a lightweight API call', async () => {
      if (!hasApiKeys.openai) {
        console.warn('Skipping OpenAI connectivity test - API key not configured');
        return;
      }

      // Test with a minimal request to check connectivity
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toBeDefined();
      // Check if response has expected structure (either object or data array)
      if (data.object === 'list') {
        expect(Array.isArray(data.data)).toBe(true);
      } else if (Array.isArray(data)) {
        // Alternative response format
        expect(data.length).toBeGreaterThanOrEqual(0);
      } else {
        // Just verify we got a valid response
        expect(typeof data).toBe('object');
      }

      console.log('✅ OpenAI API connectivity verified');
    }, 5000);
  });

  describe('Google Custom Search Service Health', () => {
    it('should have valid API credentials', () => {
      if (!hasApiKeys.google) {
        console.warn('Skipping Google Search health check - API keys not configured');
        return;
      }

      const apiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
      const engineId = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID;

      expect(apiKey).toBeDefined();
      expect(engineId).toBeDefined();
      expect(apiKey.length).toBeGreaterThan(20);
      expect(engineId.length).toBeGreaterThan(10);

      console.log('✅ Google Custom Search API credentials are valid');
    });

    it('should be able to reach Google API endpoint', async () => {
      if (!hasApiKeys.google) {
        console.warn('Skipping Google Search connectivity test - API keys not configured');
        return;
      }

      const testUrl = new URL('https://www.googleapis.com/customsearch/v1');
      testUrl.searchParams.set('key', process.env.GOOGLE_CUSTOM_SEARCH_API_KEY!);
      testUrl.searchParams.set('cx', process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID!);
      testUrl.searchParams.set('q', 'test');
      testUrl.searchParams.set('num', '1');

      const response = await fetch(testUrl.toString());
      
      // Should get a response (might be 400 for invalid query, but service is reachable)
      expect(response.status).toBeLessThan(500);
      
      const data = await response.json();
      expect(data).toBeDefined();

      console.log('✅ Google Custom Search API endpoint is reachable');
    }, 5000);
  });

  describe('Supabase Service Health', () => {
    it('should have valid Supabase credentials', () => {
      if (!hasApiKeys.supabase) {
        console.warn('Skipping Supabase health check - API keys not configured');
        return;
      }

      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      expect(url).toBeDefined();
      expect(serviceKey).toBeDefined();
      expect(url).toMatch(/^https:\/\/.*\.supabase\.co$/);
      expect(serviceKey.length).toBeGreaterThan(50);

      console.log('✅ Supabase credentials are valid');
    });

    it('should be able to connect to Supabase', async () => {
      if (!hasApiKeys.supabase) {
        console.warn('Skipping Supabase connectivity test - API keys not configured');
        return;
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
      
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Test with a simple query that should always work
      const { data, error } = await supabase
        .from('system_settings')
        .select('id')
        .limit(1);

      // Should not have a connection error
      expect(error).toBeNull();
      expect(data).toBeDefined();

      console.log('✅ Supabase database connection verified');
    }, 5000);
  });

  describe('Resend Email Service Health', () => {
    it('should have valid Resend API key', () => {
      if (!hasApiKeys.resend) {
        console.warn('Skipping Resend health check - API key not configured');
        return;
      }

      const apiKey = process.env.RESEND_API_KEY;
      expect(apiKey).toBeDefined();
      expect(apiKey).toMatch(/^re_|^yre_/); // Resend API keys start with 're_' or 'yre_'
      expect(apiKey.length).toBeGreaterThan(20);

      console.log('✅ Resend API key format is valid');
    });

    it('should be able to reach Resend API endpoint', async () => {
      if (!hasApiKeys.resend) {
        console.warn('Skipping Resend connectivity test - API key not configured');
        return;
      }

      // Test with a simple API call to check connectivity
      const response = await fetch('https://api.resend.com/domains', {
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      // Should get a response (might be 403 if no domains, but service is reachable)
      expect(response.status).toBeLessThan(500);
      
      console.log('✅ Resend API endpoint is reachable');
    }, 5000);
  });

  describe('Langchain Service Health', () => {
    it('should have valid Langchain API key', () => {
      if (!hasApiKeys.langchain) {
        console.warn('Skipping Langchain health check - API key not configured');
        return;
      }

      const apiKey = process.env.LANGCHAIN_API_KEY;
      expect(apiKey).toBeDefined();
      expect(apiKey.length).toBeGreaterThan(20);

      console.log('✅ Langchain API key is configured');
    });
  });

  describe('Overall Service Health Summary', () => {
    it('should report service availability status', () => {
      const status = {
        openai: hasApiKeys.openai ? '✅ Available' : '❌ Not configured',
        google: hasApiKeys.google ? '✅ Available' : '❌ Not configured',
        supabase: hasApiKeys.supabase ? '✅ Available' : '❌ Not configured',
        resend: hasApiKeys.resend ? '✅ Available' : '❌ Not configured',
        langchain: hasApiKeys.langchain ? '✅ Available' : '❌ Not configured',
      };

      console.log('\n📊 External Service Status:');
      console.log(`   OpenAI: ${status.openai}`);
      console.log(`   Google Search: ${status.google}`);
      console.log(`   Supabase: ${status.supabase}`);
      console.log(`   Resend: ${status.resend}`);
      console.log(`   Langchain: ${status.langchain}`);

      const availableServices = Object.values(status).filter(s => s.includes('✅')).length;
      const totalServices = Object.keys(status).length;

      console.log(`\n📈 Service Availability: ${availableServices}/${totalServices} services configured`);

      expect(availableServices).toBeGreaterThan(0); // At least one service should be available
    });
  });
});
