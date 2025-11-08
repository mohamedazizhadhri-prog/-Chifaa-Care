# ChifaaCare Authentication & RBAC Setup Guide

## Overview
This project implements OAuth2 authentication with JWT tokens and comprehensive Role-Based Access Control (RBAC) using Auth0 integration.

## Architecture

### Backend (Node.js/Express)
- **Auth0 JWT Validation**: Validates tokens from Auth0
- **Local JWT Support**: Fallback for custom authentication
- **RBAC System**: Database-driven roles and permissions
- **Middleware**: Authentication and authorization layers

### Frontend (Angular 17)
- **Auth0 Angular SDK**: OAuth2 authentication flow
- **Route Guards**: Protect routes based on roles/permissions
- **Directives**: Template-level permission checks
- **Services**: Centralized RBAC management

## Roles & Permissions

### Available Roles

1. **PATIENT** - Regular patient users
   - View/manage own appointments
   - View own medical records
   - Update own profile
   - Send/receive messages

2. **DOCTOR** - Medical professionals
   - Manage appointments
   - View/create medical records
   - Write prescriptions
   - Manage treatment plans
   - View patient information

3. **CLINIC** - Clinic staff
   - Manage appointments
   - Register patients
   - View medical records
   - View doctor/patient information

4. **PROJECT_TEAM** - ChifaaCare team members
   - View all appointments
   - Manage doctor/clinic accounts
   - View analytics
   - System oversight

5. **ADMIN** - System administrators
   - Full system access
   - User management
   - Role/permission management
   - System configuration

### Permission Format
Permissions follow the pattern: `resource:action`

Examples:
- `appointments:read`
- `appointments:write`
- `medical_records:manage`
- `users:manage`

## Backend Setup

### 1. Environment Configuration

Create `.env` file in `chifaacare-backend/`:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/mydb?schema=public"

# JWT
JWT_SECRET="your_secure_jwt_secret_key"
JWT_EXPIRES_IN="7d"

# Auth0 Configuration
AUTH0_DOMAIN="your-tenant.auth0.com"
AUTH0_AUDIENCE="https://api.chifaacare.com"
AUTH0_CLIENT_ID="your_auth0_client_id"
AUTH0_CLIENT_SECRET="your_auth0_client_secret"

# Server
PORT=3000
NODE_ENV="development"

# CORS
FRONTEND_URL="http://localhost:4200"
```

### 2. Database Setup

```bash
# Navigate to backend
cd chifaacare-backend

# Push schema to database
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Seed RBAC data (roles & permissions)
npx ts-node src/utils/rbac-seed.ts
```

### 3. Using Authentication Middleware

```typescript
import { validateJWT } from '../middleware/auth.middleware';
import { requireRole, requirePermission } from '../middleware/rbac.middleware';

// Require authentication
router.get('/protected', validateJWT, (req, res) => {
  res.json({ user: req.user });
});

// Require specific role
router.get('/admin', validateJWT, requireRole('ADMIN'), (req, res) => {
  res.json({ message: 'Admin access' });
});

// Require specific permission
router.post('/records', 
  validateJWT, 
  requirePermission('medical_records:write'), 
  (req, res) => {
    res.json({ message: 'Record created' });
  }
);

// Multiple roles allowed
router.get('/dashboard', 
  validateJWT, 
  requireRole('DOCTOR', 'ADMIN'), 
  (req, res) => {
    res.json({ message: 'Dashboard access' });
  }
);
```

### 4. Available Middleware

**Authentication:**
- `validateJWT` - Validates JWT token (required)
- `checkJwt` - Auth0 JWT validation
- `attachUserFromAuth0` - Creates/updates user from Auth0
- `optionalAuth` - Optional authentication

**Authorization:**
- `requireRole(...roles)` - Requires one of specified roles
- `requirePermission(...permissions)` - Requires one of specified permissions
- `requireAllPermissions(...permissions)` - Requires all permissions
- `requireOwnership(paramName)` - Ensures resource ownership
- `requireAdmin` - Admin only
- `requireDoctor` - Doctor only
- `requirePatient` - Patient only
- `requireClinic` - Clinic only
- `requireProjectTeam` - Project team only

## Frontend Setup

### 1. Environment Configuration

Update `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1',
  auth0Domain: 'your-tenant.auth0.com',
  auth0ClientId: 'your_auth0_client_id',
  auth0Audience: 'https://api.chifaacare.com'
};
```

### 2. App Configuration

Update `app.config.ts` or `main.ts`:

```typescript
import { provideAuth0 } from '@auth0/auth0-angular';
import { authConfig } from './app/config/auth.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAuth0(authConfig),
    // ... other providers
  ]
};
```

### 3. Route Protection

```typescript
import { Routes } from '@angular/router';
import { rbacGuard, adminGuard, doctorGuard, patientGuard } from './guards/rbac.guard';

export const routes: Routes = [
  // Public routes
  { path: '', component: HomeComponent },
  
  // Protected by authentication only
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [rbacGuard]
  },
  
  // Protected by role
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [adminGuard]
  },
  
  // Protected by specific roles
  {
    path: 'doctor',
    component: DoctorPortalComponent,
    canActivate: [rbacGuard],
    data: { roles: ['DOCTOR', 'ADMIN'] }
  },
  
  // Protected by permissions
  {
    path: 'analytics',
    component: AnalyticsComponent,
    canActivate: [rbacGuard],
    data: { permissions: ['analytics:read'] }
  }
];
```

### 4. Template-Level Permissions

```html
<!-- Show element only if user has permission -->
<button *hasPermission="'appointments:create'">
  Book Appointment
</button>

<!-- Show element only if user has role -->
<div *hasRole="'ADMIN'">
  Admin Panel
</div>

<!-- Multiple permissions (OR logic) -->
<div *hasPermission="['medical_records:read', 'medical_records:write']">
  Medical Records Section
</div>

<!-- Multiple roles (OR logic) -->
<nav *hasRole="['DOCTOR', 'ADMIN']">
  Doctor Navigation
</nav>
```

### 5. Component-Level Permission Checks

```typescript
import { Component, OnInit } from '@angular/core';
import { RbacService } from './services/rbac.service';

@Component({
  selector: 'app-dashboard',
  template: `
    <div *ngIf="canViewAnalytics">
      <app-analytics></app-analytics>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  canViewAnalytics = false;

  constructor(private rbacService: RbacService) {}

  ngOnInit() {
    this.canViewAnalytics = this.rbacService.hasPermission('analytics:read');
  }

  onAction() {
    if (this.rbacService.canPerformAction('appointments', 'create')) {
      // Create appointment
    }
  }
}
```

## Auth0 Configuration

### 1. Create Auth0 Application

1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. Create a new **Single Page Application**
3. Note your **Domain** and **Client ID**

### 2. Configure Application Settings

**Allowed Callback URLs:**
```
http://localhost:4200/callback,
https://yourdomain.com/callback
```

**Allowed Logout URLs:**
```
http://localhost:4200,
https://yourdomain.com
```

**Allowed Web Origins:**
```
http://localhost:4200,
https://yourdomain.com
```

### 3. Create API

1. Go to **APIs** in Auth0 Dashboard
2. Create new API
3. Set **Identifier**: `https://api.chifaacare.com`
4. Enable **RBAC** and **Add Permissions in Access Token**

### 4. Configure Permissions in Auth0

Add permissions in your Auth0 API:
- `appointments:read`
- `appointments:write`
- `medical_records:read`
- `medical_records:write`
- etc.

### 5. Assign Roles in Auth0

Create roles in Auth0 and assign permissions:
- **Patient Role** → Patient permissions
- **Doctor Role** → Doctor permissions
- **Admin Role** → Admin permissions

## Testing

### Backend Testing

```bash
# Test authentication endpoint
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Test protected endpoint
curl -X GET http://localhost:3000/api/v1/protected \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test role-based endpoint
curl -X GET http://localhost:3000/api/v1/admin-only \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Frontend Testing

1. Start the application
2. Click "Login" button
3. Authenticate with Auth0
4. Navigate to protected routes
5. Verify role-based UI elements show/hide correctly

## Common Issues

### Issue: "Invalid token"
**Solution:** Ensure Auth0 domain and audience match in both frontend and backend configs

### Issue: "Insufficient permissions"
**Solution:** Check that user has been assigned correct roles in Auth0 or database

### Issue: Prisma client errors
**Solution:** Run `npx prisma generate` after schema changes

### Issue: CORS errors
**Solution:** Verify FRONTEND_URL in backend .env matches your frontend URL

## Security Best Practices

1. **Never commit `.env` files** - Use `.env.example` as template
2. **Rotate JWT secrets regularly** in production
3. **Use HTTPS** in production
4. **Implement rate limiting** on authentication endpoints
5. **Log authentication attempts** for security monitoring
6. **Use short token expiration** times (7 days max)
7. **Implement refresh tokens** for better UX
8. **Validate all user inputs** on backend
9. **Use parameterized queries** (Prisma handles this)
10. **Implement CSRF protection** for state-changing operations

## Next Steps

1. Configure Auth0 account with your domain
2. Update environment variables with real Auth0 credentials
3. Run RBAC seed script to populate roles and permissions
4. Test authentication flow end-to-end
5. Customize permissions based on your business requirements
6. Implement refresh token mechanism
7. Add multi-factor authentication (MFA)
8. Set up monitoring and logging
9. Implement audit trails for sensitive operations
10. Add rate limiting and DDoS protection

## Support

For issues or questions:
- Backend: Check `chifaacare-backend/src/middleware/` for middleware implementation
- Frontend: Check `src/app/guards/` and `src/app/services/rbac.service.ts`
- Database: Check `chifaacare-backend/prisma/schema.prisma` for RBAC models
