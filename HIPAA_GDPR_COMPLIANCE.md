# HIPAA/GDPR Compliance Implementation

## Overview
ChifaaCare implements enterprise-grade security measures compliant with HIPAA (Health Insurance Portability and Accountability Act) and GDPR (General Data Protection Regulation) standards.

## 🔐 Data Encryption (AES-256-GCM)

### Implementation
**File:** `chifaacare-backend/src/utils/encryption.ts`

**Features:**
- ✅ AES-256-GCM encryption for all sensitive PII
- ✅ PBKDF2 key derivation (100,000 iterations)
- ✅ Random IV and salt for each encryption
- ✅ Authentication tags for data integrity
- ✅ Secure key management via environment variables

### Encrypted Fields

**Patient Profile:**
- Allergies
- Medications
- Medical history
- Emergency contact information

**Medical Records:**
- Diagnosis
- Symptoms
- Clinical notes
- Lab results

**Messages:**
- Message content (end-to-end encryption)

**User Data:**
- Phone numbers
- Sensitive personal information

### Usage Example

```typescript
import { encrypt, decrypt } from './utils/encryption';

// Encrypt sensitive data before storing
const encryptedData = encrypt('Patient medical history...');

// Decrypt when retrieving
const decryptedData = decrypt(encryptedData);
```

## 📊 Audit Logging System

### Implementation
**File:** `chifaacare-backend/src/utils/audit-logger.ts`

**Database Model:** `AuditLog` (in schema.prisma)

### Tracked Events

**User Actions:**
- CREATE, READ, UPDATE, DELETE
- LOGIN, LOGOUT
- EXPORT, SHARE, PRINT
- ACCESS_DENIED

**Resources:**
- PATIENT
- MEDICAL_RECORD
- APPOINTMENT
- PRESCRIPTION
- LAB_RESULT
- MESSAGE
- TREATMENT_PLAN
- BILLING

### Audit Log Fields

```typescript
{
  userId: string;          // Who performed the action
  userEmail: string;       // User's email
  userRole: string;        // User's role (DOCTOR, PATIENT, etc.)
  action: AuditAction;     // What action was performed
  resource: AuditResource; // What resource was accessed
  resourceId: string;      // Specific resource ID
  ipAddress: string;       // IP address of request
  userAgent: string;       // Browser/client information
  timestamp: DateTime;     // When it occurred
  success: boolean;        // Whether action succeeded
  errorMessage: string;    // Error if failed
}
```

### Usage Example

```typescript
import { logPatientAccess, AuditAction } from './utils/audit-logger';

// Log patient data access
await logPatientAccess(
  doctorId,
  patientId,
  AuditAction.READ,
  req,
  true
);
```

### Audit Middleware

```typescript
import { auditMiddleware, AuditResource, AuditAction } from './utils/audit-logger';

// Automatically log all access to medical records
router.get(
  '/medical-records/:id',
  protect,
  auditMiddleware(AuditResource.MEDICAL_RECORD, AuditAction.READ),
  getMedicalRecord
);
```

## 🛡️ Security Features

### 1. Field-Level Encryption
**File:** `chifaacare-backend/src/middleware/encryption.middleware.ts`

Automatically encrypts/decrypts sensitive fields:

```typescript
// Encrypt before saving
router.post(
  '/patients',
  protect,
  encryptSensitiveFields('PatientProfile'),
  createPatient
);

// Decrypt when retrieving
router.get(
  '/patients/:id',
  protect,
  decryptSensitiveFields('PatientProfile'),
  getPatient
);
```

### 2. Prisma Middleware

Transparent encryption at ORM level:

```typescript
import { createPrismaEncryptionMiddleware } from './middleware/encryption.middleware';

prisma.$use(createPrismaEncryptionMiddleware());
```

### 3. Data Masking

For logging and debugging (GDPR compliance):

```typescript
import { maskSensitiveData } from './utils/encryption';

// Logs: "12***89" instead of "123456789"
console.log(maskSensitiveData(phoneNumber));
```

## 📋 Setup Instructions

### 1. Add Audit Log Table

```bash
# Stop backend server first
cd chifaacare-backend

# Generate Prisma client with new AuditLog model
npx prisma generate

# Push schema to database
npx prisma db push
```

### 2. Configure Encryption Key

Add to `.env`:

```env
# Generate a secure 32-byte key
ENCRYPTION_KEY=your-secure-256-bit-encryption-key-here

# Generate using Node.js:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Update Controllers

Add audit logging to sensitive endpoints:

```typescript
import { logPatientAccess, AuditAction } from '../utils/audit-logger';
import { auditMiddleware, AuditResource } from '../utils/audit-logger';

// Method 1: Manual logging
export const getPatient = async (req: any, res: Response) => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: req.params.id }
    });
    
    // Log access
    await logPatientAccess(
      req.user.id,
      req.params.id,
      AuditAction.READ,
      req
    );
    
    res.json({ status: 'success', data: patient });
  } catch (error) {
    // Log failed access
    await logPatientAccess(
      req.user.id,
      req.params.id,
      AuditAction.READ,
      req,
      false,
      error.message
    );
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Method 2: Middleware (automatic)
router.get(
  '/patients/:id',
  protect,
  auditMiddleware(AuditResource.PATIENT, AuditAction.READ),
  getPatient
);
```

### 4. Enable Prisma Encryption Middleware

In `src/index.ts` or where you initialize Prisma:

```typescript
import { PrismaClient } from '@prisma/client';
import { createPrismaEncryptionMiddleware } from './middleware/encryption.middleware';

const prisma = new PrismaClient();

// Enable automatic encryption/decryption
prisma.$use(createPrismaEncryptionMiddleware());
```

## 🔍 Compliance Features

### HIPAA Compliance

✅ **Access Controls**
- Role-based access control (RBAC)
- User authentication with JWT
- Session management

✅ **Audit Controls**
- Complete audit trail of all PHI access
- User activity logging
- Failed access attempt tracking

✅ **Data Integrity**
- AES-256-GCM with authentication tags
- Checksums for data verification

✅ **Transmission Security**
- HTTPS/TLS for all communications
- Encrypted data at rest and in transit

✅ **Person/Entity Authentication**
- Multi-factor authentication ready
- Strong password requirements
- Session timeout

### GDPR Compliance

✅ **Right to Access**
- Audit logs show all data access
- Users can request access history

✅ **Right to Erasure**
- Soft delete with audit trail
- Hard delete capability for compliance

✅ **Data Minimization**
- Only collect necessary data
- Encrypt all PII

✅ **Privacy by Design**
- Encryption by default
- Minimal data exposure
- Secure defaults

✅ **Breach Notification**
- Audit logs for security monitoring
- Failed access attempt tracking
- Anomaly detection ready

## 📊 Audit Trail Queries

### Get Patient Access History

```typescript
import { getAuditTrail } from './utils/audit-logger';

const history = await getAuditTrail(
  patientId,
  AuditResource.PATIENT,
  startDate,
  endDate
);
```

### Get User Activity

```typescript
import { getUserActivityLog } from './utils/audit-logger';

const activity = await getUserActivityLog(
  userId,
  startDate,
  endDate,
  100 // limit
);
```

### Monitor Failed Access

```typescript
import { getFailedAccessAttempts } from './utils/audit-logger';

// Get failed attempts in last 60 minutes
const failures = await getFailedAccessAttempts(60);
```

## 🚀 Production Deployment

### AWS Configuration (Recommended)

**RDS (Database):**
- Enable encryption at rest
- Use VPC isolation
- Enable automated backups
- Enable Multi-AZ for high availability

**S3 (File Storage):**
- Enable server-side encryption (SSE-S3 or SSE-KMS)
- Use bucket policies for access control
- Enable versioning
- Enable access logging

**VPC Configuration:**
- Private subnets for RDS
- Public subnets for application servers
- Security groups for network isolation
- NAT Gateway for outbound traffic

**Environment Variables:**
```env
DATABASE_URL=postgresql://user:pass@rds-endpoint:5432/db?sslmode=require
ENCRYPTION_KEY=<secure-256-bit-key>
JWT_SECRET=<secure-jwt-secret>
NODE_ENV=production
```

### Elasticsearch Integration (Optional)

For advanced audit log analytics:

```typescript
// Install: npm install @elastic/elasticsearch

import { Client } from '@elastic/elasticsearch';

const esClient = new Client({
  node: process.env.ELASTICSEARCH_URL,
  auth: {
    apiKey: process.env.ELASTICSEARCH_API_KEY
  }
});

// Index audit logs to Elasticsearch
export async function indexAuditLog(entry: AuditLogEntry) {
  await esClient.index({
    index: 'audit-logs',
    document: entry
  });
}
```

## 📝 Compliance Checklist

### Before Production

- [ ] Generate secure ENCRYPTION_KEY (256-bit)
- [ ] Enable HTTPS/TLS on all endpoints
- [ ] Configure RDS with encryption at rest
- [ ] Set up VPC with private subnets
- [ ] Enable audit logging on all sensitive endpoints
- [ ] Test encryption/decryption functionality
- [ ] Verify audit trail completeness
- [ ] Set up automated backups
- [ ] Configure security groups
- [ ] Enable CloudWatch monitoring
- [ ] Set up alerting for failed access attempts
- [ ] Document data retention policies
- [ ] Create incident response plan
- [ ] Conduct security audit
- [ ] Train staff on HIPAA/GDPR requirements

## 🔒 Security Best Practices

1. **Never log decrypted sensitive data**
2. **Use maskSensitiveData() for logging**
3. **Rotate encryption keys periodically**
4. **Monitor audit logs for anomalies**
5. **Implement rate limiting**
6. **Use strong password policies**
7. **Enable MFA for admin accounts**
8. **Regular security audits**
9. **Keep dependencies updated**
10. **Follow principle of least privilege**

## 📞 Support

For security concerns or compliance questions:
- Review audit logs regularly
- Monitor failed access attempts
- Report suspicious activity immediately
- Follow incident response procedures

---

**Last Updated:** October 2025  
**Compliance Standards:** HIPAA, GDPR, HITECH  
**Encryption:** AES-256-GCM  
**Audit Retention:** Configurable (default: 7 years for HIPAA)
