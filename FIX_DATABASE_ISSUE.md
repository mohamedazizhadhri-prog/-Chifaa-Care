# 🔧 FIX: Database Not Showing in Site

## Problem
Frontend loads but no doctors/patients appear because database is empty.

## Solution Steps

### 1️⃣ Stop All Servers
Close both backend and frontend windows

### 2️⃣ Check Database Status
```batch
cd chifaacare-backend
node check-database-data.js
```

### 3️⃣ Seed Database with Test Data
```batch
npm run seed:safe
```

OR create test accounts manually:
```batch
node create-test-accounts.js
node create-clinics.js
```

### 4️⃣ Verify Database Has Data
```batch
node check-database-data.js
```

You should see:
- ✅ Doctors: 5+ 
- ✅ Patients: 3+
- ✅ Clinics: 1+

### 5️⃣ Restart Application
```batch
cd ..
start-all.bat
```

### 6️⃣ Test in Browser
1. Go to http://localhost:4200
2. Login with test account:
   - **Patient**: patient@chifaacare.com / patient123
   - **Clinic**: clinic@chifaacare.com / clinic123
3. Check if doctors appear in patient view
4. Check if patients appear in doctor/clinic view

## Common Issues

### Issue: "No doctors found"
**Solution**: Run seeding scripts
```batch
cd chifaacare-backend
npm run seed:safe
```

### Issue: "Prisma error"
**Solution**: Regenerate Prisma client and migrate
```batch
cd chifaacare-backend
npx prisma generate
npx prisma migrate dev
```

### Issue: "Connection refused"
**Solution**: Check .env file has correct DATABASE_URL
```batch
type .env
```

### Issue: "CORS error in console"
**Solution**: Backend might not be running
- Check if http://localhost:3000/api/health responds
- Restart backend with: `start-backend.bat`

## Test Accounts After Seeding

- **Admin**: admin@chifaacare.com / admin123
- **Patient**: patient@chifaacare.com / patient123  
- **Clinic**: clinic@chifaacare.com / clinic123
- **Doctors**: Created by seed script (check with node check-database-data.js)

## Verification Checklist

- [ ] Backend running on port 3000
- [ ] Frontend running on port 4200
- [ ] Database has doctors (run check-database-data.js)
- [ ] Database has patients (run check-database-data.js)
- [ ] Can login with test account
- [ ] Doctors visible in patient interface
- [ ] Patients visible in doctor interface

## Quick Commands Reference

```batch
# Check what's in database
cd chifaacare-backend
node check-database-data.js

# Seed database
npm run seed:safe

# Create specific test accounts
node create-test-accounts.js
node create-clinics.js

# Reset and re-seed database (WARNING: deletes all data!)
npx prisma migrate reset

# Start application
cd ..
start-all.bat
```

## Need More Help?

Run the diagnostic script and share the output:
```batch
cd chifaacare-backend
node check-database-data.js
```
