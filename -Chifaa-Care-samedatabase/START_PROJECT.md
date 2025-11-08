# 🚀 ChifaaCare - Complete Startup Guide

This guide will help you start the ChifaaCare project from scratch, connect to Neon database, and run both frontend and backend servers.

## 📋 Prerequisites Checklist

Before starting, ensure you have:
- [x] Node.js v18 or higher installed
- [x] npm or yarn package manager
- [x] Neon database account and connection string
- [x] Terminal/Command Prompt access

Check your Node version:
```bash
node --version
npm --version
```

---

## 🎯 Quick Start (For Impatient Developers)

```bash
# Run this automated script (created below)
npm run start:all
```

---

## 📝 Step-by-Step Manual Setup

### Step 1: Install Dependencies

#### Frontend Dependencies
```bash
# From project root
npm install
```

#### Backend Dependencies
```bash
# Navigate to backend
cd chifaacare-backend
npm install
cd ..
```

---

### Step 2: Configure Environment Variables

Your `.env` file is already set up with Neon! But let's verify and enhance it:

#### Generate Secure Keys
```bash
cd chifaacare-backend

# Generate JWT Secret (copy the output)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate Encryption Key (copy the output)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Update .env File
Open `chifaacare-backend/.env` and replace:
- `JWT_SECRET="your_jwt_secret_key_here"` → paste generated secret
- `ENCRYPTION_KEY="your_256_bit_encryption_key_here_64_characters"` → paste generated key

**Your DATABASE_URL is already configured! ✅**

---

### Step 3: Setup Database Schema

```bash
cd chifaacare-backend

# Generate Prisma Client
npm run prisma:generate

# Run database migrations (creates all tables)
npm run migrate:deploy

# Optional: Seed database with test data
npm run seed:safe
```

**Expected Output:**
```
✓ Generated Prisma Client
✓ Migrations applied successfully
✓ Database schema is up to date
```

---

### Step 4: Verify Database Connection

```bash
# Test Neon connection
npm run test:neon
```

**Expected Output:**
```
✓ Connected to Neon Database
✓ Database: neondb
✓ Host: ep-lively-sound-agfp605h-pooler.c-2.eu-central-1.aws.neon.tech
```

---

### Step 5: Start Backend Server

```bash
# From chifaacare-backend directory
npm run dev

# OR from project root
npm run backend
```

**Expected Output:**
```
🚀 Server running on http://localhost:3000
📊 API Docs: http://localhost:3000/api-docs
✓ Database connected
✓ Socket.io initialized
```

**Test Backend:**
Open browser → `http://localhost:3000/api/health`

---

### Step 6: Start Frontend Server

Open a **NEW terminal window**:

```bash
# From project root
npm start

# OR
ng serve
```

**Expected Output:**
```
✓ Compiled successfully
✓ Application bundle generation complete
✓ Localized bundle generation complete

Local:   http://localhost:4200
```

**Test Frontend:**
Open browser → `http://localhost:4200`

---

## 🎉 Success Checklist

After starting both servers, verify:

- [ ] Backend running on `http://localhost:3000`
- [ ] Frontend running on `http://localhost:4200`
- [ ] API health endpoint responds: `http://localhost:3000/api/health`
- [ ] Frontend loads without errors
- [ ] No console errors in browser DevTools
- [ ] Database connection successful (check backend logs)

---

## 🐛 Troubleshooting

### Problem: "Cannot connect to database"
**Solution:**
```bash
cd chifaacare-backend
npm run test:neon
```
Check if DATABASE_URL in `.env` is correct.

### Problem: "Port 3000 already in use"
**Solution:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Or change port in .env
PORT=3001
```

### Problem: "Prisma Client not generated"
**Solution:**
```bash
cd chifaacare-backend
npm run prisma:generate
```

### Problem: "Module not found"
**Solution:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# For backend
cd chifaacare-backend
rm -rf node_modules package-lock.json
npm install
```

### Problem: "Migration failed"
**Solution:**
```bash
cd chifaacare-backend

# Reset database (WARNING: deletes all data)
npm run migrate:reset

# Or create new migration
npm run migrate:dev --name init
```

---

## 📊 Useful Commands

### Development
```bash
# Start backend only
npm run backend

# Start frontend only
npm start

# Build for production
npm run build

# Open Prisma Studio (Database GUI)
cd chifaacare-backend
npm run prisma:studio
```

### Database Management
```bash
cd chifaacare-backend

# View database in browser
npm run prisma:studio

# Create new migration
npm run migrate:dev --name your_migration_name

# Reset database
npm run migrate:reset

# Check migration status
npx prisma migrate status
```

### Testing
```bash
# Test database connection
cd chifaacare-backend
npm run test:neon

# Create test accounts
npm run create:accounts

# List all users
node list-users.js
```

---

## 🌐 Access Points

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:4200 | Main application |
| Backend API | http://localhost:3000 | REST API |
| API Docs | http://localhost:3000/api-docs | Swagger documentation |
| Prisma Studio | http://localhost:5555 | Database GUI |

---

## 🔐 Default Test Accounts

After running `npm run create:accounts`, you'll have:

**Admin Account:**
- Email: `admin@chifaacare.com`
- Password: (check console output)

**Doctor Account:**
- Email: `doctor@chifaacare.com`
- Password: (check console output)

**Patient Account:**
- Email: `patient@chifaacare.com`
- Password: (check console output)

**Clinic Account:**
- Email: `clinic@chifaacare.com`
- Password: (check console output)

---

## 📱 Next Steps

1. **Test the Application:**
   - Register a new account
   - Login with test account
   - Navigate through different pages
   - Test appointment booking

2. **Explore the Database:**
   ```bash
   cd chifaacare-backend
   npm run prisma:studio
   ```

3. **Check API Documentation:**
   Open `http://localhost:3000/api-docs`

4. **Review Logs:**
   - Backend logs appear in terminal
   - Frontend logs in browser console

---

## 🆘 Need Help?

If you encounter issues:

1. Check both terminal windows for error messages
2. Review browser console (F12) for frontend errors
3. Verify `.env` configuration
4. Ensure database migrations are applied
5. Check if ports 3000 and 4200 are available

---

## 🎯 Development Workflow

```bash
# Morning routine:
1. git pull                          # Get latest changes
2. cd chifaacare-backend && npm install && cd ..
3. npm install                       # Update dependencies
4. npm run backend                   # Terminal 1
5. npm start                         # Terminal 2
6. Open http://localhost:4200        # Start coding!

# Before committing:
1. npm run build                     # Test production build
2. Check for console errors
3. Verify database migrations
4. git add, commit, push
```

---

**Happy Coding! 🚀**

For more details, check:
- `README.md` - Project overview
- `NEON_SETUP.md` - Database setup details
- `AUTH_RBAC_SETUP.md` - Authentication guide
