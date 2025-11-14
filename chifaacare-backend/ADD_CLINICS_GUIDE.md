# 🏥 Add Clinics to Database

## Quick Guide - Add 4 Clinics

This script will add **4 clinics** to your database:
- 🇱🇾 **3 in Libya:** Tripoli, Benghazi, Misrata
- 🇹🇳 **1 in Tunisia:** Tunis

**✅ Safe:** Won't affect existing data or duplicate clinics

---

## 🚀 How to Run

### Step 1: Make Sure Backend is Set Up

```bash
cd chifaacare-backend

# Make sure dependencies are installed
npm install
```

### Step 2: Run the Script

```bash
node create-clinics.js
```

### Expected Output:

```
🏥 Creating clinics in database...

✅ Created: Tripoli Medical Center
   📧 Email: contact@tripolimedical.ly
   📍 Location: Tripoli, Libya
   🏥 Status: ACTIVE

✅ Created: Benghazi Health Clinic
   📧 Email: info@benghazihealth.ly
   📍 Location: Benghazi, Libya
   🏥 Status: ACTIVE

✅ Created: Misrata Care Center
   📧 Email: admin@misratacare.ly
   📍 Location: Misrata, Libya
   🏥 Status: ACTIVE

✅ Created: Tunis Central Hospital
   📧 Email: contact@tuniscentral.tn
   📍 Location: Tunis, Tunisia
   🏥 Status: ACTIVE

📊 Summary:
✅ Created: 4 clinic(s)
⏭️  Skipped: 0 clinic(s) (already exist)
📍 Libya: 3 clinics (Tripoli, Benghazi, Misrata)
📍 Tunisia: 1 clinic (Tunis)

✅ Done! Database updated successfully.
```

---

## 📋 Clinics Details

### 1️⃣ Tripoli Medical Center (Libya)
- **Email:** contact@tripolimedical.ly
- **Phone:** +218-21-444-5555
- **Address:** Gargaresh Road, Building 42, Tripoli
- **Status:** ACTIVE
- **Website:** https://tripolimedical.ly

### 2️⃣ Benghazi Health Clinic (Libya)
- **Email:** info@benghazihealth.ly
- **Phone:** +218-61-222-3333
- **Address:** Al Keish Street, Suite 15, Benghazi
- **Status:** ACTIVE
- **Website:** https://benghazihealth.ly

### 3️⃣ Misrata Care Center (Libya)
- **Email:** admin@misratacare.ly
- **Phone:** +218-51-666-7777
- **Address:** Mediterranean Avenue, Floor 3, Misrata
- **Status:** ACTIVE
- **Website:** https://misratacare.ly

### 4️⃣ Tunis Central Hospital (Tunisia)
- **Email:** contact@tuniscentral.tn
- **Phone:** +216-71-888-9999
- **Address:** Avenue Habib Bourguiba, Building 25, Tunis
- **Status:** ACTIVE
- **Website:** https://tuniscentral.tn

---

## ✅ Verify in Admin Interface

After running the script:

1. **Start your servers** (if not running):
   ```bash
   # Terminal 1 - Backend
   cd chifaacare-backend
   npm run dev

   # Terminal 2 - Frontend
   npm start
   ```

2. **Open browser:** http://localhost:4200

3. **Login as admin**

4. **Go to:** Admin Portal → Clinics

5. **You should see all 4 clinics!** 🎉

---

## 🔄 Run Again?

If you run the script again:
- ✅ **Safe:** Already existing clinics will be skipped
- ✅ **No duplicates:** Checks email uniqueness
- ✅ **No data loss:** Existing data stays intact

Example output if clinics exist:
```
⏭️  Skipped: Tripoli Medical Center (already exists)
⏭️  Skipped: Benghazi Health Clinic (already exists)
...
📊 Summary:
✅ Created: 0 clinic(s)
⏭️  Skipped: 4 clinic(s) (already exist)
```

---

## 🗑️ Delete Clinics (Optional)

If you want to remove these clinics later:

### Option 1: From Admin Interface
1. Go to Admin → Clinics
2. Click 🗑️ delete button on each clinic
3. Confirm deletion

### Option 2: Using Prisma Studio
```bash
cd chifaacare-backend
npm run prisma:studio
```
Then delete from the visual interface

### Option 3: Script to Delete
```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const emails = [
    'contact@tripolimedical.ly',
    'info@benghazihealth.ly',
    'admin@misratacare.ly',
    'contact@tuniscentral.tn'
  ];
  for (const email of emails) {
    try {
      await prisma.clinic.delete({ where: { email } });
      console.log('Deleted:', email);
    } catch (e) {
      console.log('Not found:', email);
    }
  }
  await prisma.\$disconnect();
})();
"
```

---

## 🐛 Troubleshooting

### Error: "Can't find Prisma"
**Solution:**
```bash
cd chifaacare-backend
npm install @prisma/client
npx prisma generate
```

### Error: "Database connection failed"
**Solution:**
```bash
# Test connection first
npm run test:neon

# Check .env file has correct DATABASE_URL
```

### Error: "Unique constraint failed"
**Solution:** Clinic with that email already exists (this is normal, it will skip)

---

## 📊 View in Database

To see the clinics in the database directly:

```bash
cd chifaacare-backend
npm run prisma:studio
```

Opens http://localhost:5555 - Navigate to "Clinic" table

---

## ✨ Summary

**Command to run:**
```bash
cd chifaacare-backend
node create-clinics.js
```

**Result:**
- 🇱🇾 3 clinics in Libya
- 🇹🇳 1 clinic in Tunisia
- ✅ All set to ACTIVE status
- ✅ All set to COMPLETED onboarding
- ✅ Safe (no duplicates or data loss)

**Next:**
View them in Admin Portal → Clinics page! 🎉

---

**Ready to run? Copy and paste this:**
```bash
cd chifaacare-backend && node create-clinics.js
```
