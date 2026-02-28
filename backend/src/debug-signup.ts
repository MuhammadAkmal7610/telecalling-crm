async function debugSignup() {
    const url = 'http://localhost:3000/api/v1/auth/signup';
    const payload = {
        email: 'test' + Date.now() + '@example.com',
        password: 'password123',
        orgName: 'Debug Org ' + Date.now(),
        phone: '+1234567890'
    };

    try {
        console.log('Sending signup request to:', url);
        console.log('Payload:', JSON.stringify(payload, null, 2));

        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        console.log('Status:', res.status);
        console.log('Response Data:', JSON.stringify(data, null, 2));
    } catch (error: any) {
        console.log('Fetch Error:', error.message);
    }
}

debugSignup();
