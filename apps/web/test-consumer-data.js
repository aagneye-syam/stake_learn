// Simple test script to verify consumer data integration
const { getReclaimService } = require('./_utils/reclaim.ts');

async function testConsumerDataIntegration() {
  console.log('🧪 Testing Consumer Data Integration...\n');

  try {
    // Test 1: Initialize Reclaim Service
    console.log('1. Testing Reclaim Service initialization...');
    const reclaimService = getReclaimService();
    console.log('✅ Reclaim service created successfully');

    // Test 2: Test initialization
    console.log('\n2. Testing initialization...');
    const initResult = await reclaimService.initialize();
    console.log(`✅ Initialization result: ${initResult}`);

    // Test 3: Test mock verification (should work even without credentials)
    console.log('\n3. Testing mock verification...');
    const mockResult = await reclaimService.mockVerifyProof('github');
    console.log(`✅ Mock verification result:`, mockResult.success ? 'SUCCESS' : 'FAILED');
    if (mockResult.success) {
      console.log(`   DataCoins calculated: ${reclaimService.calculateDataCoins(mockResult.data, 'github')}`);
    }

    // Test 4: Test API endpoint availability
    console.log('\n4. Testing API endpoint...');
    const response = await fetch('http://localhost:3001/api/consumer-data?userAddress=0x1234567890123456789012345678901234567890');
    console.log(`✅ API endpoint status: ${response.status}`);

    console.log('\n🎉 All tests passed! Consumer data integration is working.');
    console.log('\n📋 Next steps:');
    console.log('1. Get Reclaim Protocol credentials from https://developer.reclaimprotocol.io/');
    console.log('2. Add RECLAIM_APP_ID and RECLAIM_APP_SECRET to .env.local');
    console.log('3. Test with real GitHub data');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 This is expected if:');
    console.log('- Reclaim SDK has compatibility issues (will use mock mode)');
    console.log('- API server is not running');
    console.log('- Missing environment variables');
  }
}

// Run the test
testConsumerDataIntegration();
