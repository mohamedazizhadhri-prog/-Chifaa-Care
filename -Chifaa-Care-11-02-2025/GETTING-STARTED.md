# 🚀 ChifaaCare - Quick Start Guide

Your project is now connected to your **Neon PostgreSQL database**!

## 📋 What's Been Set Up

✅ **Backend Environment** (.env file created)
- Database: Connected to Neon PostgreSQL
- JWT Authentication: Configured
- Encryption: Set up for HIPAA/GDPR compliance
- Stripe: Test mode ready

✅ **Database Connection**
- Provider: Neon (Serverless PostgreSQL)
- Connection: Pooler enabled
- SSL: Required and configured

---

## 🎯 How to Start Your Project

### Option 1: One-Click Start (Recommended)
Simply double-click: **`START-PROJECT.bat`**

This will:
1. Check Node.js installation
2. Install dependencies (if needed)
3. Test database connection
4. Run database migrations
5. Start the backend server

### Option 2: Test Database First
Double-click: **`TEST-DATABASE.bat`**

This will verify your Neon connection without starting the server.

### Option 3: Manual Start
```bash
cd -Chifaa-Care-samedatabase\chifaacare-backend
npm install
npm run dev
```

---

## 🌐 Important URLs

Once started, your backend will be available at:

- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/api/health

---

## 🔐 Your Neon Database Details

**Connection String Format:**
```
postgresql://neondb_owner:npg_HeYafdV3i6QC@ep-lively-sound-agfp605h-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

**Database Information:**
- Host: ep-lively-sound-agfp605h-pooler.c-2.eu-central-1.aws.neon.tech
- Database: neondb
- User: neondb_owner
- Region: EU Central 1 (Frankfurt)
- Connection: Pooler enabled for better performance

---

## 📦 What's Installed

### Backend Dependencies
- **Express.js** - Web framework
- **Prisma** - Database ORM
- **TypeScript** - Type safety
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Stripe** - Payment processing
- **Socket.IO** - Real-time communication

---

## 🛠️ Common Commands

### Backend Development
```bash
cd -Chifaa-Care-samedatabase\chifaacare-backend

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database commands
npm run prisma:generate    # Generate Prisma Client
npm run prisma:studio      # Open Prisma Studio (database GUI)
npm run migrate:dev        # Run migrations in dev
npm run migrate:deploy     # Deploy migrations to production
```

### Database Management
```bash
# View database in browser
npm run prisma:studio

# Create new migration
npm run migrate:dev

# Reset database (caution!)
npm run migrate:reset
```

---

## 🔍 Troubleshooting

### Database Connection Issues

**Problem:** "Can't reach database server"
- **Solution:** Check your internet connection. Neon requires an active internet connection.

**Problem:** "Password authentication failed"
- **Solution:** Your credentials may have expired. Check your Neon dashboard for updated credentials.

**Problem:** "SSL connection required"
- **Solution:** This is already configured in your .env file. Don't modify the SSL settings.

### General Issues

**Problem:** Port 3000 is already in use
- **Solution:** Stop any other apps using port 3000, or change PORT in .env file

**Problem:** Missing dependencies
- **Solution:** Run `npm install` in the backend directory

**Problem:** TypeScript errors
- **Solution:** Run `npm run build` to check for compilation errors

---

## 📱 Frontend Setup

To start the frontend (Angular app):

```bash
cd -Chifaa-Care-samedatabase
npm install
npm start
```

The frontend will be available at: http://localhost:4200

---

## 🎨 Project Structure

```
-Chifaa-Care-11-1-2025/
├── START-PROJECT.bat          # 🚀 One-click start
├── TEST-DATABASE.bat          # 🧪 Test database connection
└── -Chifaa-Care-samedatabase/
    ├── chifaacare-backend/    # Backend API
    │   ├── src/               # TypeScript source code
    │   ├── prisma/            # Database schema & migrations
    │   └── .env               # Environment variables (KEEP SECRET!)
    └── src/                   # Frontend Angular app
```

---

## 🔒 Security Notes

⚠️ **IMPORTANT:** Never commit your `.env` file to Git!

Your `.env` file contains:
- Database credentials
- JWT secret keys
- API keys (Stripe, Cloudinary)

Keep these **private** and **secure**!

---

## 📚 Additional Resources

- **Neon Dashboard**: https://console.neon.tech
- **Prisma Docs**: https://www.prisma.io/docs
- **Express Docs**: https://expressjs.com
- **Angular Docs**: https://angular.io/docs

---

## ✨ Next Steps

1. Run **START-PROJECT.bat** to start your backend
2. Open http://localhost:3000/api-docs to explore the API
3. Test the connection with http://localhost:3000/api/health
4. Start building! 🎉

---

## 💡 Tips

- Use **Prisma Studio** (`npm run prisma:studio`) to view/edit database records visually
- Check the **API Documentation** at /api-docs for all available endpoints
- The backend will auto-reload when you make changes (thanks to ts-node-dev)
- Use **Thunder Client** or **Postman** to test API endpoints

---

**Need help?** Check the existing documentation files in the project directories!

Happy coding! 🚀
