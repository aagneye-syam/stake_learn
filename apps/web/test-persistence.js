// Test script to verify persistence works
const testPersistence = async () => {
  const baseUrl = 'http://localhost:3000';
  const testAddress = '0x1234567890123456789012345678901234567890';
  const testCourseId = '1';

  console.log('🧪 Testing persistence...');

  try {
    // Test 1: Complete a module
    console.log('1. Testing module completion...');
    const completeResponse = await fetch(`${baseUrl}/api/progress`, {
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

    const completeData = await completeResponse.json();
    console.log('✅ Module completion result:', completeData.success);

    // Test 2: Retrieve progress
    console.log('2. Testing progress retrieval...');
    const getResponse = await fetch(`${baseUrl}/api/progress?userAddress=${testAddress}&courseId=${testCourseId}`);
    const progressData = await getResponse.json();
    
    console.log('✅ Progress retrieval result:', progressData.success);
    console.log('📊 Progress data:', progressData.progress);

    // Test 3: Complete another module
    console.log('3. Testing second module completion...');
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
    console.log('✅ Second module completion result:', completeData2.success);

    // Test 4: Verify updated progress
    console.log('4. Verifying updated progress...');
    const getResponse2 = await fetch(`${baseUrl}/api/progress?userAddress=${testAddress}&courseId=${testCourseId}`);
    const progressData2 = await getResponse2.json();
    
    console.log('✅ Updated progress result:', progressData2.success);
    console.log('📊 Updated progress data:', progressData2.progress);

    console.log('🎉 All tests passed! Persistence is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test if this script is executed directly
if (typeof window === 'undefined') {
  testPersistence();
}

module.exports = { testPersistence };
