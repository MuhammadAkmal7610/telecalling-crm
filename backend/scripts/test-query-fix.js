const axios = require('axios');

async function testApi() {
  try {
    console.log('Testing source=website (lowercase)...');
    const res1 = await axios.get('http://localhost:3000/api/v1/leads?source=website&limit=1');
    console.log('Response 1 Status:', res1.status);
    
    console.log('\nTesting source=invalid (should be 400)...');
    const res2 = await axios.get('http://localhost:3000/api/v1/leads?source=invalid&limit=1');
    console.log('Response 2 Status:', res2.status);
    
    console.log('\nTesting status=fresh (lowercase)...');
    const res3 = await axios.get('http://localhost:3000/api/v1/leads?status=fresh&limit=1');
    console.log('Response 3 Status:', res3.status);
  } catch (error) {
    if (error.response) {
      console.error('Error Status:', error.response.status);
      console.error('Error Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
  }
}

testApi();
