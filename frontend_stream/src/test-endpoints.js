/**
 * Script de test des endpoints
 * Exécutez ce script dans la console du navigateur pour tester les connexions
 */

async function testEndpoints() {
  const baseUrl = window.location.origin;
  const endpoints = [
    '/functions/v1/make-server-a01b5ee4/health',
    '/functions/v1/make-server-a01b5ee4/config',
    '/functions/v1/make-server-a01b5ee4/live/sessions'
  ];

  console.log('🔍 Testing endpoints from:', baseUrl);
  console.log('==========================================');

  for (const endpoint of endpoints) {
    const url = baseUrl + endpoint;
    console.log(`\n📡 Testing: ${url}`);
    
    try {
      const startTime = Date.now();
      const response = await fetch(url, {
        method: endpoint.includes('/sessions') ? 'POST' : 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        body: endpoint.includes('/sessions') ? JSON.stringify({
          courseId: 'test',
          title: 'Test Session',
          description: 'Test Description',
          settings: {
            quality: 'HD',
            allowChat: true,
            allowQA: true,
            recordSession: false,
            maxViewers: 10,
            isPrivate: false
          }
        }) : undefined
      });
      
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Success (${responseTime}ms):`, data);
      } else {
        console.log(`❌ Error ${response.status}:`, response.statusText);
        const text = await response.text();
        if (text) console.log('Response body:', text);
      }
    } catch (error) {
      console.log(`💥 Exception:`, error.message);
    }
  }
  
  console.log('\n==========================================');
  console.log('Test complete! Check the results above.');
}

// Auto-run if in browser console
if (typeof window !== 'undefined') {
  console.log('🚀 Starting endpoint tests...');
  testEndpoints();
}

// Export for manual use
window.testEndpoints = testEndpoints;