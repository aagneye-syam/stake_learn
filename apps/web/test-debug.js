// Debug the API issue
const testAPI = async () => {
  try {
    console.log('Testing API with detailed logging...');
    
    // Test POST request
    const response = await fetch('http://localhost:3000/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentAddress: '0x123',
        rewardType: 'course_progress',
        courseId: 1,
        progressPercentage: 25,
        milestone: 'module_1_completed',
        moduleId: 1,
        totalModules: 4
      })
    });
    
    console.log('POST Response status:', response.status);
    const data = await response.json();
    console.log('POST Response:', data);
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test GET request
    console.log('\nTesting GET request...');
    const getResponse = await fetch('http://localhost:3000/api/progress?userAddress=0x123&courseId=1&totalModules=4');
    console.log('GET Response status:', getResponse.status);
    const getData = await getResponse.json();
    console.log('GET Response:', getData);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
};

testAPI();
