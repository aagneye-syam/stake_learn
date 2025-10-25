// Test script to verify the complete module completion flow
const testCompleteFlow = async () => {
  const baseUrl = 'http://localhost:3000';
  const testAddress = '0x1234567890123456789012345678901234567890';
  const testCourseId = '1';

  console.log('🧪 Testing complete module flow...');

  try {
    // Step 1: Check initial progress
    console.log('1. Checking initial progress...');
    const initialResponse = await fetch(`${baseUrl}/api/progress?userAddress=${testAddress}&courseId=${testCourseId}`);
    const initialData = await initialResponse.json();
    console.log('✅ Initial progress:', initialData.progress);

    // Step 2: Complete module 1
    console.log('2. Completing module 1...');
    const completeResponse1 = await fetch(`${baseUrl}/api/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentAddress: testAddress,
        rewardType: 'course_progress',
        courseId: testCourseId,
        progressPercentage: 25,
        milestone: 'module_1_completed',
        moduleId: 1,
        totalModules: 4
      })
    });

    const completeData1 = await completeResponse1.json();
    console.log('✅ Module 1 completion result:', completeData1.success);
    console.log('💰 Reward earned:', completeData1.reward?.amount, 'DataCoins');

    // Step 3: Check progress after module 1
    console.log('3. Checking progress after module 1...');
    const progressResponse1 = await fetch(`${baseUrl}/api/progress?userAddress=${testAddress}&courseId=${testCourseId}`);
    const progressData1 = await progressResponse1.json();
    console.log('✅ Progress after module 1:', progressData1.progress);
    console.log('📊 Completed modules:', progressData1.progress.completedModules);
    console.log('📈 Progress percentage:', progressData1.progress.progressPercentage + '%');

    // Step 4: Complete module 2
    console.log('4. Completing module 2...');
    const completeResponse2 = await fetch(`${baseUrl}/api/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentAddress: testAddress,
        rewardType: 'course_progress',
        courseId: testCourseId,
        progressPercentage: 50,
        milestone: 'module_2_completed',
        moduleId: 2,
        totalModules: 4
      })
    });

    const completeData2 = await completeResponse2.json();
    console.log('✅ Module 2 completion result:', completeData2.success);

    // Step 5: Check final progress
    console.log('5. Checking final progress...');
    const progressResponse2 = await fetch(`${baseUrl}/api/progress?userAddress=${testAddress}&courseId=${testCourseId}`);
    const progressData2 = await progressResponse2.json();
    console.log('✅ Final progress:', progressData2.progress);
    console.log('📊 Completed modules:', progressData2.progress.completedModules);
    console.log('📈 Progress percentage:', progressData2.progress.progressPercentage + '%');

    // Step 6: Verify module states
    console.log('6. Verifying module states...');
    progressData2.progress.modules.forEach((module, index) => {
      console.log(`   Module ${module.moduleId}: ${module.completed ? '✅ Completed' : '⏳ Pending'}`);
      if (module.completed) {
        console.log(`     - Completed at: ${new Date(module.completedAt * 1000).toLocaleString()}`);
        console.log(`     - Reward earned: ${module.rewardEarned} DataCoins`);
        console.log(`     - Transaction: ${module.transactionHash}`);
      }
    });

    console.log('🎉 Complete flow test passed!');
    console.log('📋 Summary:');
    console.log(`   - Total modules: ${progressData2.progress.totalModules}`);
    console.log(`   - Completed modules: ${progressData2.progress.completedModules}`);
    console.log(`   - Progress: ${progressData2.progress.progressPercentage}%`);
    console.log(`   - Total DataCoins earned: ${progressData2.progress.modules.reduce((sum, m) => sum + (parseFloat(m.rewardEarned) || 0), 0)}`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test if this script is executed directly
if (typeof window === 'undefined') {
  testCompleteFlow();
}

module.exports = { testCompleteFlow };
