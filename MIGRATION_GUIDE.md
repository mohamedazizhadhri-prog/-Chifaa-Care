# 🔄 Database Migration Guide for New Features

## Overview
This migration adds support for:
1. **Payment System** - Patient appointment payments
2. **Payout System** - Clinic-to-doctor payouts
3. **Communication** - Doctor chat and video calls

---

## Step 1: Backup Your Database

**IMPORTANT:** Always backup before migrating!

```bash
# Using pg_dump (if you have PostgreSQL tools)
pg_dump your_database_url > backup_$(date +%Y%m%d).sql

# OR use Prisma Studio to export data
cd chifaacare-backend
npm run prisma:studio
# Then manually export important tables
```

---

## Step 2: Update Prisma Schema

The schema has been updated in `schema.prisma` with new models.

###New Models Added:

1. **Payment** - Stores appointment payment details
2. **DoctorConnectedAccount** - Stripe Connect account info
3. **Payout** - Clinic-to-doctor payout records
4. **ChatMessage** - Doctor-to-doctor messages
5. **VideoCallLog** - Call history and metadata

---

## Step 3: Run Migration

```bash
cd chifaacare-backend

# Generate Prisma Client with new models
npm run prisma:generate

# Create and apply migration
npx prisma migrate dev --name add_payment_payout_communication

# If you get errors, try:
npx prisma db push
```

---

## Step 4: Verify Migration

```bash
# Check database schema
npx prisma studio

# Or check migration status
npx prisma migrate status
```

Expected new tables:
- ✅ Payment
- ✅ DoctorConnectedAccount
- ✅ Payout
- ✅ ChatMessage
- ✅ VideoCallLog

---

## Rollback (if needed)

If something goes wrong:

```bash
# Rollback last migration
npx prisma migrate resolve --rolled-back <migration_name>

# Or restore from backup
psql your_database_url < backup_file.sql
```

---

## Common Issues

### Issue: "Migration failed"
**Solution:** Check database connection
```bash
npm run test:neon
```

### Issue: "Unique constraint failed"
**Solution:** Clear test data first or use `db push` instead
```bash
npx prisma db push --accept-data-loss
```

### Issue: "Prisma Client out of sync"
**Solution:** Regenerate client
```bash
npm run prisma:generate
```

---

## Next Steps After Migration

1. ✅ Verify all tables created
2. ✅ Test creating records in each new table
3. ✅ Install Stripe package: `npm install stripe`
4. ✅ Install Agora package: `npm install agora-access-token`
5. ✅ Add environment variables for Stripe & Agora

---

## Testing the Migration

Run this test script after migration:

```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testNewModels() {
  try {
    console.log('Testing new models...');
    
    // Test Payment model
    const paymentCount = await prisma.payment.count();
    console.log('✅ Payment model:', paymentCount, 'records');
    
    // Test DoctorConnectedAccount model
    const accountCount = await prisma.doctorConnectedAccount.count();
    console.log('✅ DoctorConnectedAccount model:', accountCount, 'records');
    
    // Test Payout model
    const payoutCount = await prisma.payout.count();
    console.log('✅ Payout model:', payoutCount, 'records');
    
    // Test ChatMessage model
    const chatCount = await prisma.chatMessage.count();
    console.log('✅ ChatMessage model:', chatCount, 'records');
    
    // Test VideoCallLog model
    const callCount = await prisma.videoCallLog.count();
    console.log('✅ VideoCallLog model:', callCount, 'records');
    
    console.log('\n🎉 All new models working!');
    
    await prisma.\$disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testNewModels();
"
```

---

**Ready to migrate?** Follow the steps above in order!
