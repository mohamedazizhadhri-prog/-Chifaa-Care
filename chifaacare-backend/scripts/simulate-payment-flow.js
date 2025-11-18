// Usage: node scripts/simulate-payment-flow.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. Find a patient, doctor, and appointment
  const patient = await prisma.user.findFirst({ where: { role: 'PATIENT' } });
  const doctor = await prisma.user.findFirst({ where: { role: 'DOCTOR' } });
  if (!patient || !doctor) throw new Error('No patient or doctor found');
  let appointment = await prisma.appointment.findFirst({ where: { patientId: patient.id, doctorId: doctor.id } });
  if (!appointment) {
    appointment = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        appointmentDate: new Date(Date.now() + 86400000),
        endTime: new Date(Date.now() + 86400000 + 1800000),
        status: 'RESERVED',
        reason: 'Demo payment',
      },
    });
  }
  // 2. Create a Payment (simulate PaymentIntent)
  const payment = await prisma.payment.create({
    data: {
      appointmentId: appointment.id,
      patientId: patient.id,
      amount: 50,
      currency: 'USD',
      status: 'PENDING',
      stripePaymentIntentId: 'pi_demo_123',
      stripeClientSecret: 'cs_demo_123',
    },
  });
  console.log('Created payment:', payment.id);
  // 3. Simulate Stripe webhook: mark payment as SUCCEEDED, appointment as COMPLETED
  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: 'SUCCEEDED' },
  });
  await prisma.appointment.update({
    where: { id: appointment.id },
    data: { status: 'COMPLETED' },
  });
  console.log('Simulated Stripe webhook: payment succeeded, appointment completed.');
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
