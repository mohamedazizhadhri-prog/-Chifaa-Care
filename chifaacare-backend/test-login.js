const axios = require('axios');

(async () => {
  try {
    const res = await axios.post('http://localhost:3000/api/v1/auth/login', {
      email: 'test@example.com',
      password: 'Test@1234'
    }, { validateStatus: () => true });
    console.log('Status:', res.status);
    console.log('Data:', res.data);
  } catch (e) {
    console.error('Request error:', e.message);
  }
})();
