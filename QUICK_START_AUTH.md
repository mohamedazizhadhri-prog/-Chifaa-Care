# Quick Start: Authentication & RBAC

## 🚀 Get Started in 5 Minutes

### Step 1: Backend Setup

```bash
cd chifaacare-backend

# Already installed dependencies ✅
# Already created .env file ✅

# Push database schema (when servers are stopped)
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Seed roles and permissions
npx ts-node src/utils/rbac-seed.ts
```

### Step 2: Configure Auth0 (Optional - for OAuth)

If you want to use Auth0 OAuth:

1. Create account at https://auth0.com
2. Create a Single Page Application
3. Create an API with identifier: `https://api.chifaacare.com`
4. Update `.env` files with your Auth0 credentials

**Backend** (`chifaacare-backend/.env`):
```env
AUTH0_DOMAIN="your-tenant.auth0.com"
AUTH0_AUDIENCE="https://api.chifaacare.com"
AUTH0_CLIENT_ID="your_client_id"
AUTH0_CLIENT_SECRET="your_client_secret"
```

**Frontend** (`src/environments/environment.ts`):
```typescript
auth0Domain: 'your-tenant.auth0.com',
auth0ClientId: 'your_client_id',
auth0Audience: 'https://api.chifaacare.com'
```

### Step 3: Start Servers

```bash
# Terminal 1 - Backend
cd chifaacare-backend
npm run dev

# Terminal 2 - Frontend
cd ..
npm start
```

## 📝 Using RBAC in Your Code

### Backend Route Protection

```typescript
import { validateJWT } from '../middleware/auth.middleware';
import { requireRole, requirePermission } from '../middleware/rbac.middleware';

// Require authentication
router.get('/api/profile', validateJWT, controller.getProfile);

// Require DOCTOR role
router.get('/api/patients', validateJWT, requireRole('DOCTOR'), controller.getPatients);

// Require permission
router.post('/api/records', validateJWT, requirePermission('medical_records:write'), controller.createRecord);

// Multiple roles
router.get('/api/dashboard', validateJWT, requireRole('DOCTOR', 'ADMIN'), controller.getDashboard);
```

### Frontend Route Protection

```typescript
// app.routes.ts
import { rbacGuard, adminGuard, doctorGuard } from './guards/rbac.guard';

const routes: Routes = [
  // Admin only
  { path: 'admin', component: AdminComponent, canActivate: [adminGuard] },
  
  // Doctor only
  { path: 'doctor', component: DoctorComponent, canActivate: [doctorGuard] },
  
  // Specific roles
  { 
    path: 'analytics', 
    component: AnalyticsComponent, 
    canActivate: [rbacGuard],
    data: { roles: ['ADMIN', 'PROJECT_TEAM'] }
  },
  
  // Specific permissions
  { 
    path: 'records', 
    component: RecordsComponent, 
    canActivate: [rbacGuard],
    data: { permissions: ['medical_records:read'] }
  }
];
```

### Frontend Template Permissions

```html
<!-- Show only to admins -->
<button *hasRole="'ADMIN'">Delete User</button>

<!-- Show only with permission -->
<div *hasPermission="'appointments:create'">
  <button>Book Appointment</button>
</div>

<!-- Multiple roles -->
<nav *hasRole="['DOCTOR', 'ADMIN']">
  <a routerLink="/patients">Patients</a>
</nav>
```

### Frontend Component Checks

```typescript
import { RbacService } from './services/rbac.service';

export class MyComponent {
  constructor(private rbacService: RbacService) {}

  ngOnInit() {
    // Check role
    if (this.rbacService.hasRole('ADMIN')) {
      // Admin-specific logic
    }

    // Check permission
    if (this.rbacService.hasPermission('appointments:write')) {
      // Can create appointments
    }

    // Check action
    if (this.rbacService.canPerformAction('medical_records', 'read')) {
      // Can read medical records
    }
  }
}
```

## 🎭 Available Roles

- **PATIENT** - Regular patients
- **DOCTOR** - Medical professionals  
- **CLINIC** - Clinic staff
- **PROJECT_TEAM** - ChifaaCare team
- **ADMIN** - System administrators

## 🔑 Common Permissions

- `appointments:read` / `appointments:write` / `appointments:manage`
- `medical_records:read` / `medical_records:write` / `medical_records:manage`
- `patients:read` / `patients:create` / `patients:manage`
- `doctors:read` / `doctors:manage`
- `users:manage`
- `analytics:read`
- `system:manage`

## 📚 Full Documentation

See `AUTH_RBAC_SETUP.md` for complete documentation.

## ⚠️ Important Notes

1. **Seed RBAC data** before testing: `npx ts-node src/utils/rbac-seed.ts`
2. **Stop servers** before running Prisma commands
3. **JWT tokens** work without Auth0 for local development
4. **Auth0 is optional** - use for production OAuth
5. **Default role** for new users is PATIENT

## 🧪 Testing

Test with existing auth system:
1. Login with existing credentials
2. User will have default PATIENT role
3. Manually update role in database for testing:
   ```sql
   UPDATE "User" SET role = 'DOCTOR' WHERE email = 'test@example.com';
   ```
4. Assign roles via UserRole table for RBAC system

## 🔧 Troubleshooting

**"Permission denied"** → Check user has correct role/permission in database
**"Invalid token"** → Verify JWT_SECRET matches in .env
**Prisma errors** → Stop servers, run `npx prisma generate`
**CORS errors** → Check FRONTEND_URL in backend .env
