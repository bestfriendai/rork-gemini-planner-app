// Simple API test script to verify OpenRouter and Perplexity integrations
const fetch = require('node-fetch');
require('dotenv').config();

// API Keys
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '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';
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY || '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';

// Models
const GEMINI_MODEL = 'google/gemini-2.5-flash-lite-preview-06-17';
const PERPLEXITY_MODEL = 'llama-3.1-sonar-small-128k-online';

// Test OpenRouter API
async function testOpenRouter() {
  console.log('\n🧪 Testing OpenRouter API...');
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://localhost:8082',
        'X-Title': 'Gemini Planner App'
      },
      body: JSON.stringify({
        model: GEMINI_MODEL,
        messages: [
          {
            role: 'user',
            content: 'Hello! This is a test message. Please respond with "OpenRouter API is working!"'
          }
        ],
        max_tokens: 50,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenRouter API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        model: GEMINI_MODEL
      });
      return false;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (content) {
      console.log('✅ OpenRouter API Success!');
      console.log('📝 Response:', content.trim());
      return true;
    } else {
      console.error('❌ OpenRouter API: No content in response');
      console.log('📄 Full response:', JSON.stringify(data, null, 2));
      return false;
    }
  } catch (error) {
    console.error('❌ OpenRouter API Exception:', error.message);
    return false;
  }
}

// Test Perplexity API
async function testPerplexity() {
  console.log('\n🔍 Testing Perplexity API...');
  
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: PERPLEXITY_MODEL,
        messages: [
          {
            role: 'user',
            content: 'What is the current date? Please respond with "Perplexity API is working!" and today\'s date.'
          }
        ],
        max_tokens: 50,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Perplexity API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        model: PERPLEXITY_MODEL
      });
      return false;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (content) {
      console.log('✅ Perplexity API Success!');
      console.log('📝 Response:', content.trim());
      return true;
    } else {
      console.error('❌ Perplexity API: No content in response');
      console.log('📄 Full response:', JSON.stringify(data, null, 2));
      return false;
    }
  } catch (error) {
    console.error('❌ Perplexity API Exception:', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting API Integration Tests...');
  console.log('🔑 OpenRouter Key:', OPENROUTER_API_KEY ? `${OPENROUTER_API_KEY.substring(0, 10)}...` : 'NOT SET');
  console.log('🔑 Perplexity Key:', PERPLEXITY_API_KEY ? `${PERPLEXITY_API_KEY.substring(0, 10)}...` : 'NOT SET');
  
  const openRouterResult = await testOpenRouter();
  const perplexityResult = await testPerplexity();
  
  console.log('\n📊 Test Results:');
  console.log(`OpenRouter: ${openRouterResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Perplexity: ${perplexityResult ? '✅ PASS' : '❌ FAIL'}`);
  
  if (openRouterResult && perplexityResult) {
    console.log('\n🎉 All API integrations are working correctly!');
    console.log('✅ Ready to rebuild the app.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some API integrations failed. Please check the errors above.');
    process.exit(1);
  }
}

// Run the tests
runTests().catch(console.error);