#!/usr/bin/env node

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const OpenAI = require('openai');

async function testOpenAI() {
  console.log('🔍 Testing OpenAI API connection...');
  
  // Check if API key exists
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY not found in .env.local');
    return;
  }
  
  console.log(`✅ API Key found: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`);
  console.log(`📏 Key length: ${apiKey.length} characters`);
  
  try {
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey,
    });
    
    console.log('🚀 Testing API connection...');
    
    // Test with a simple models list call
    const models = await openai.models.list();
    console.log(`✅ API connection successful!`);
    console.log(`📊 Available models: ${models.data.length}`);
    console.log(`🎯 First few models: ${models.data.slice(0, 3).map(m => m.id).join(', ')}`);
    
    // Test with a simple chat completion
    console.log('🧪 Testing chat completion...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: 'Say "Hello, API test successful!"' }
      ],
      max_tokens: 10
    });
    
    console.log(`✅ Chat completion successful!`);
    console.log(`💬 Response: ${completion.choices[0].message.content}`);
    
  } catch (error) {
    console.error('❌ OpenAI API test failed:');
    console.error(`   Error: ${error.message}`);
    console.error(`   Status: ${error.status || 'Unknown'}`);
    console.error(`   Type: ${error.type || 'Unknown'}`);
    
    if (error.status === 401) {
      console.error('🔑 This is an authentication error. Check your API key.');
    } else if (error.status === 429) {
      console.error('💰 This might be a billing/quota issue.');
    } else if (error.status === 403) {
      console.error('🚫 This might be a permissions issue.');
    }
  }
}

testOpenAI().catch(console.error);


















