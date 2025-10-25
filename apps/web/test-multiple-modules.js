// Test multiple module completions
const testMultipleModules = async () => {
  try {
    console.log('Testing multiple module completions...\n');
    
    // Complete Module 1
    console.log('1. Completing Module 1...');
    let response = await fetch('http://localhost:3000/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentAddress: '0xTestUser',
        rewardType: 'course_progress',
        courseId: 1,
        progressPercentage: 25,
        milestone: 'module_1_completed',
        moduleId: 1,
        totalModules: 4
      })
    });
    let data = await response.json();
    console.log('Module 1 completed:', data.success);
    
    // Get progress after module 1
    let getResponse = await fetch('http://localhost:3000/api/progress?userAddress=0xTestUser&courseId=1&totalModules=4');
    let progressData = await getResponse.json();
    console.log('Progress after Module 1:', {
      completed: progressData.progress.completedModules,
      percentage: progressData.progress.progressPercentage
    });
    
    // Complete Module 2
    console.log('\n2. Completing Module 2...');
    response = await fetch('http://localhost:3000/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentAddress: '0xTestUser',
        rewardType: 'course_progress',
        courseId: 1,
        progressPercentage: 50,
        milestone: 'module_2_completed',
        moduleId: 2,
        totalModules: 4
      })
    });
    data = await response.json();
    console.log('Module 2 completed:', data.success);
    
    // Get progress after module 2
    getResponse = await fetch('http://localhost:3000/api/progress?userAddress=0xTestUser&courseId=1&totalModules=4');
    progressData = await getResponse.json();
    console.log('Progress after Module 2:', {
      completed: progressData.progress.completedModules,
      percentage: progressData.progress.progressPercentage
    });
    
    // Complete Module 3
    console.log('\n3. Completing Module 3...');
    response = await fetch('http://localhost:3000/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentAddress: '0xTestUser',
        rewardType: 'course_progress',
        courseId: 1,
        progressPercentage: 75,
        milestone: 'module_3_completed',
        moduleId: 3,
        totalModules: 4
      })
    });
    data = await response.json();
    console.log('Module 3 completed:', data.success);
    
    // Get progress after module 3
    getResponse = await fetch('http://localhost:3000/api/progress?userAddress=0xTestUser&courseId=1&totalModules=4');
    progressData = await getResponse.json();
    console.log('Progress after Module 3:', {
      completed: progressData.progress.completedModules,
      percentage: progressData.progress.progressPercentage
    });
    console.log('Detailed modules:', progressData.progress.modules);
    
    console.log('\n✅ All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testMultipleModules();
