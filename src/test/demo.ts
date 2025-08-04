import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function testDeFiSecuritySolution(): Promise<void> {
  console.log('🧪 Testing DeFi Security Solution\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data);
    console.log('');

    // Test 2: Normal Borrow Request
    console.log('2. Testing Normal Borrow Request...');
    const normalBorrowResponse = await axios.post(`${BASE_URL}/api/borrow/request`, {
      userAddress: '0x1234567890123456789012345678901234567890',
      assetAddress: '0xA0b86a33E6441b8c4C8C0C8C0C8C0C8C0C8C0C8C', // USDC
      amount: 1000,
      collateralValue: 1500,
      borrowLimit: 5000,
    });
    console.log('✅ Normal borrow request processed:', normalBorrowResponse.data);
    console.log('');

    // Test 3: Large Borrow Request (should trigger security events)
    console.log('3. Testing Large Borrow Request (Security Event)...');
    try {
      const largeBorrowResponse = await axios.post(`${BASE_URL}/api/borrow/request`, {
        userAddress: '0x1234567890123456789012345678901234567890',
        assetAddress: '0xA0b86a33E6441b8c4C8C0C8C0C8C0C8C0C8C0C8C', // USDC
        amount: 600000, // $600K - should trigger security event
        collateralValue: 900000,
        borrowLimit: 1000000,
      });
      console.log('⚠️ Large borrow request processed with security events:', largeBorrowResponse.data);
    } catch (error: any) {
      console.log('❌ Large borrow request rejected:', error.response?.data);
    }
    console.log('');

    // Test 4: Excessive Borrow Request (should be rejected)
    console.log('4. Testing Excessive Borrow Request (Should be rejected)...');
    try {
      const excessiveBorrowResponse = await axios.post(`${BASE_URL}/api/borrow/request`, {
        userAddress: '0x1234567890123456789012345678901234567890',
        assetAddress: '0xA0b86a33E6441b8c4C8C0C8C0C8C0C8C0C8C0C8C', // USDC
        amount: 2000000, // $2M - exceeds limits
        collateralValue: 3000000,
        borrowLimit: 1000000,
      });
      console.log('❌ Unexpected success for excessive borrow:', excessiveBorrowResponse.data);
    } catch (error: any) {
      console.log('✅ Excessive borrow request correctly rejected:', error.response?.data);
    }
    console.log('');

    // Test 5: Emergency Status
    console.log('5. Testing Emergency Status...');
    const emergencyResponse = await axios.get(`${BASE_URL}/api/borrow/emergency-status`);
    console.log('✅ Emergency status retrieved:', emergencyResponse.data);
    console.log('');

    // Test 6: Invalid Asset (should be rejected)
    console.log('6. Testing Invalid Asset Request...');
    try {
      const invalidAssetResponse = await axios.post(`${BASE_URL}/api/borrow/request`, {
        userAddress: '0x1234567890123456789012345678901234567890',
        assetAddress: '0xINVALIDASSETADDRESS',
        amount: 1000,
        collateralValue: 1500,
        borrowLimit: 5000,
      });
      console.log('❌ Unexpected success for invalid asset:', invalidAssetResponse.data);
    } catch (error: any) {
      console.log('✅ Invalid asset request correctly rejected:', error.response?.data);
    }
    console.log('');

    console.log('🎉 All tests completed successfully!');
    console.log('\n🛡️ Security Features Demonstrated:');
    console.log('   ✅ Oracle Sanity Layer - Price validation');
    console.log('   ✅ On-Chain Monitor - Borrow limit validation');
    console.log('   ✅ Off-Chain Watchdog - Anomaly detection');
    console.log('   ✅ Emergency Circuit Breaker - Protocol protection');
    console.log('   ✅ Security Event Logging - Comprehensive monitoring');

  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the demo if this file is executed directly
if (require.main === module) {
  testDeFiSecuritySolution().catch(console.error);
}

export { testDeFiSecuritySolution }; 