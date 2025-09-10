import axios from 'axios';

async function main() {
  const base = 'http://localhost:3000/api/v1';

  const create = async (payload: any) => {
    try {
      const { data } = await axios.post(`${base}/auth/signup`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('Created user:', data?.data?.user?.email || payload.email);
      return data;
    } catch (e: any) {
      if (e.response) {
        console.error('Error:', e.response.status, e.response.data);
      } else {
        console.error('Error:', e.message);
      }
    }
  };

  // Doctor
  await create({
    email: 'dr.jane@example.com',
    password: 'P@ssw0rd123!',
    firstName: 'Jane',
    lastName: 'Doe',
    role: 'DOCTOR',
    specialization: 'Cardiology',
  });

  // Doctor 2
  await create({
    email: 'dr.ahmed@example.com',
    password: 'P@ssw0rd123!',
    firstName: 'Ahmed',
    lastName: 'Karim',
    role: 'DOCTOR',
    specialization: 'Dermatology',
  });

  // Patient
  await create({
    email: 'patient.alex@example.com',
    password: 'P@ssw0rd123!',
    firstName: 'Alex',
    lastName: 'Smith',
    role: 'PATIENT',
  });

  console.log('Done.');
}

main();
