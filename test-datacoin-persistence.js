// Test script to verify DataCoin persistence
const testDataCoinPersistence = async () => {
  const userAddress = "0x6E4C42FB6dc855347A25812823Fe614c9139e50a";
  const baseUrl = "http://localhost:3000";

  console.log("🧪 Testing DataCoin Persistence...\n");

  try {
    // 1. Check current transactions
    console.log("1. Fetching current transactions...");
    const response = await fetch(`${baseUrl}/api/transactions?userAddress=${userAddress}`);
    const data = await response.json();
    
    console.log(`   Found ${data.transactions.length} transactions`);
    
    // 2. Calculate DataCoin balance
    const dataCoinTransactions = data.transactions.filter(tx => tx.type === 'datacoin');
    const totalDataCoins = dataCoinTransactions.reduce((sum, tx) => sum + parseFloat(tx.amount || '0'), 0);
    
    console.log(`   DataCoin transactions: ${dataCoinTransactions.length}`);
    console.log(`   Total DataCoins: ${totalDataCoins}`);
    
    // 3. Calculate certificates
    const completionTransactions = data.transactions.filter(tx => tx.type === 'complete');
    console.log(`   Completion transactions: ${completionTransactions.length}`);
    console.log(`   Certificates: ${completionTransactions.length}`);
    
    // 4. Add a test transaction
    console.log("\n2. Adding test DataCoin transaction...");
    const testTx = await fetch(`${baseUrl}/api/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userAddress,
        type: 'datacoin',
        amount: '5',
        courseId: '2',
        hash: `0x${Math.random().toString(16).substring(2, 66)}`,
        timestamp: Math.floor(Date.now() / 1000),
        status: 'success',
        reason: 'Test persistence'
      })
    });
    
    if (testTx.ok) {
      console.log("   ✅ Test transaction added successfully");
    } else {
      console.log("   ❌ Failed to add test transaction");
    }
    
    // 5. Verify persistence
    console.log("\n3. Verifying persistence...");
    const newResponse = await fetch(`${baseUrl}/api/transactions?userAddress=${userAddress}`);
    const newData = await newResponse.json();
    
    const newDataCoinTransactions = newData.transactions.filter(tx => tx.type === 'datacoin');
    const newTotalDataCoins = newDataCoinTransactions.reduce((sum, tx) => sum + parseFloat(tx.amount || '0'), 0);
    
    console.log(`   New total transactions: ${newData.transactions.length}`);
    console.log(`   New DataCoin transactions: ${newDataCoinTransactions.length}`);
    console.log(`   New total DataCoins: ${newTotalDataCoins}`);
    
    if (newTotalDataCoins > totalDataCoins) {
      console.log("   ✅ DataCoin persistence working!");
    } else {
      console.log("   ❌ DataCoin persistence not working");
    }
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
};

// Run the test
testDataCoinPersistence();
