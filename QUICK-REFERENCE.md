# ⚡ Quick Reference - ChifaaCare

## 🚀 Start Commands

| Action | Command |
|--------|---------|
| **Start Everything** | Double-click `START-PROJECT.bat` |
| **Test Database** | Double-click `TEST-DATABASE.bat` |
| **Setup Check** | Double-click `SETUP-CHECK.bat` |

## 📍 Important URLs

| Service | URL |
|---------|-----|
| Backend API | http://localhost:3000 |
| API Docs | http://localhost:3000/api-docs |
| Health Check | http://localhost:3000/api/health |
| Frontend | http://localhost:4200 |
| Prisma Studio | http://localhost:5555 (after running `npm run prisma:studio`) |

## 💻 Terminal Commands

### Backend (in chifaacare-backend folder)
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Run production build
npm run prisma:studio    # Open database GUI
npm run migrate:dev      # Create migration
npm run migrate:deploy   # Apply migrations
```

### Frontend (in main folder)
```bash
npm start                # Start Angular app
npm run build            # Build for production
npm test                 # Run tests
```

## 🗄️ Database Commands

```bash
npx prisma studio        # Visual database editor
npx prisma generate      # Generate Prisma client
npx prisma db pull       # Pull schema from database
npx prisma db push       # Push schema to database
npx prisma migrate dev   # Create new migration
```

## 🔑 Environment Variables

Located in: `chifaacare-backend\.env`

```
DATABASE_URL     # Neon PostgreSQL connection
JWT_SECRET       # Authentication secret
ENCRYPTION_KEY   # Data encryption key
PORT             # Server port (3000)
STRIPE_SECRET    # Payment processing
```

## 📁 Project Structure

```
-Chifaa-Care-11-1-2025/
├── START-PROJECT.bat              # 🚀 Start server
├── TEST-DATABASE.bat              # 🧪 Test database
├── SETUP-CHECK.bat                # ⚙️  Verify setup
├── GETTING-STARTED.md             # 📖 Full guide
├── VISUAL-GUIDE.md                # 🎨 Visual documentation
└── -Chifaa-Care-samedatabase/
    ├── chifaacare-backend/        # API server
    │   ├── src/                   # TypeScript source
    │   ├── prisma/                # Database schema
    │   └── .env                   # 🔐 Secrets
    └── src/                       # Angular frontend
```

## 🆘 Quick Fixes

### Port Already in Use
```bash
# Windows: Find and kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID [process_id] /F
```

### Database Connection Error
1. Check internet connection
2. Verify .env file exists
3. Run TEST-DATABASE.bat
4. Check Neon dashboard: https://console.neon.tech

### Module Not Found
```bash
npm install                  # Install dependencies
npx prisma generate         # Generate Prisma client
```

### TypeScript Errors
```bash
npm run build               # Check for compilation errors
```

## 🔐 Security Checklist

- [ ] .env file is NOT in Git
- [ ] Strong JWT_SECRET is set
- [ ] Database password is secure
- [ ] HTTPS/SSL enabled (Neon)
- [ ] CORS configured properly

## 📊 Neon Database Info

```
Host:     ep-lively-sound-agfp605h-pooler.c-2.eu-central-1.aws.neon.tech
Database: neondb
Region:   EU Central 1
SSL:      Required ✅
Pooler:   Enabled ✅
```

## 🎯 API Endpoints Preview

### Authentication
- POST `/api/v1/auth/register` - Register user
- POST `/api/v1/auth/login` - Login user
- POST `/api/v1/auth/logout` - Logout user

### Doctors
- GET `/api/v1/doctors` - List all doctors
- GET `/api/v1/doctors/:id` - Get doctor details
- POST `/api/v1/doctors` - Create doctor (admin)

### Appointments
- GET `/api/v1/appointments` - List appointments
- POST `/api/v1/appointments` - Book appointment
- PATCH `/api/v1/appointments/:id` - Update appointment

### Payments
- POST `/api/v1/payment/create-intent` - Create payment
- POST `/api/v1/payment/webhook` - Stripe webhook

**See full API docs at:** http://localhost:3000/api-docs

## 🧪 Testing

### Test Database Connection
```bash
node test-neon-connection.js
```

### Test API Endpoints
Use tools like:
- Thunder Client (VS Code extension)
- Postman
- curl commands
- Built-in Swagger UI at /api-docs

## 📱 Frontend Development

```bash
cd -Chifaa-Care-samedatabase
npm install                  # Install dependencies
npm start                    # Start dev server (port 4200)
ng generate component name   # Create new component
ng build                     # Build for production
```

## 🔄 Git Commands (Safe)

```bash
git status                   # Check what changed
git add .                    # Stage changes
git commit -m "message"      # Commit changes
git push                     # Push to remote

# ⚠️ NEVER COMMIT .env FILE!
```

## 💡 Pro Tips

1. Keep **API docs** open while developing
2. Use **Prisma Studio** to view data visually
3. Check **health endpoint** regularly
4. Monitor **console** for errors
5. Read error messages - they help!

## 🆘 Need Help?

1. Check `GETTING-STARTED.md` for detailed guide
2. Check `VISUAL-GUIDE.md` for architecture
3. Visit API docs at http://localhost:3000/api-docs
4. Check Neon docs: https://neon.tech/docs
5. Check Prisma docs: https://www.prisma.io/docs

---

**Happy Coding! 🚀**

Print this page for quick reference while coding!
