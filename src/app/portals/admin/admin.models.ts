// Central admin-facing models mirroring backend Prisma schema

export type UUID = string;

export type UserRoleName = 'PATIENT' | 'DOCTOR' | 'CLINIC' | 'ADMIN';
export type ClinicStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED' | 'INACTIVE';
export type OnboardingStep = 'REGISTRATION' | 'DOCUMENT_UPLOAD' | 'PAYMENT' | 'EHR_INTEGRATION' | 'COMPLETED';
export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED' | 'NO_SHOW';
export type DocumentType = 'NDA' | 'CONTRACT' | 'LICENSE' | 'INSURANCE' | 'TAX_DOCUMENT' | 'OTHER';
export type DocumentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// Core
export interface User {
  id: UUID;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  dateOfBirth?: string | null; // ISO
  gender?: string | null;
  profileImage?: string | null;
  role: UserRoleName; // default PATIENT
  clinicRole?: 'ADMIN' | 'PROVIDER' | 'STAFF' | 'BILLING' | null;
  isEmailVerified: boolean;
  isActive: boolean;
  lastLogin?: string | null; // ISO
  auth0Id?: string | null;
  clinicId?: UUID | null;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface DoctorProfile {
  id: UUID;
  userId: UUID;
  specialization?: string | null;
  bio?: string | null;
  licenseNumber?: string | null;
  experience?: number | null;
  consultationFee?: number | null;
  availableDays: string; // JSON string []
  availableHours: string; // JSON string []
  languages: string; // JSON string []
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface PatientProfile {
  id: UUID;
  userId: UUID;
  bloodType?: string | null;
  height?: number | null;
  weight?: number | null;
  allergies: string; // JSON string []
  medications: string; // JSON string []
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface Clinic {
  id: UUID;
  name: string;
  description?: string | null;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone: string;
  email: string;
  website?: string | null;
  taxId?: string | null;
  status: ClinicStatus;
  onboardingStep: OnboardingStep;
  createdAt: string;
  updatedAt: string;
  ehrSystem?: string | null;
  ehrApiKey?: string | null;
  ehrApiUrl?: string | null;
  ehrConnected: boolean;
  billingEmail?: string | null;
  billingAddress?: string | null;
  billingCity?: string | null;
  billingCountry?: string | null;
  billingPostalCode?: string | null;
}

export interface ClinicService {
  id: UUID;
  clinicId: UUID;
  name: string;
  description?: string | null;
  category: string;
  isActive: boolean;
  basePrice: number;
  priceTiers?: any; // JSON
  durationMinutes: number;
  requiresSpecialist: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: UUID;
  patientId: UUID;
  doctorId: UUID;
  appointmentDate: string; // ISO
  clinicServiceId?: UUID | null;
  endTime: string; // ISO
  status: AppointmentStatus;
  reason: string;
  notes?: string | null;
  diagnosis?: string | null;
  prescription?: string | null;
  followUpDate?: string | null; // ISO
  isFollowUp: boolean;
  originalAppointmentId?: UUID | null;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: UUID;
  senderId: UUID;
  recipientId: UUID;
  content: string;
  isRead: boolean;
  appointmentId?: UUID | null;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface TreatmentPlan {
  id: UUID;
  patientId: UUID;
  doctorId: UUID;
  title: string;
  diagnosis?: string | null;
  goals?: string | null;
  carePlan?: string | null;
  status: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED';
  startDate: string; // ISO
  endDate?: string | null; // ISO
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface TreatmentNote {
  id: UUID;
  planId: UUID;
  doctorId: UUID;
  content: string;
  isImportant: boolean;
  createdAt: string; // ISO
}

export interface Medication {
  id: UUID;
  planId: UUID;
  name: string;
  dose?: string | null;
  frequency?: string | null;
  route?: string | null;
  instructions?: string | null;
  startDate: string;
  endDate?: string | null;
  isActive: boolean;
}

// RBAC
export interface Role {
  id: UUID;
  name: UserRoleName; // PATIENT, DOCTOR, CLINIC, ADMIN
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: UUID;
  name: string; // e.g. appointments:read
  resource: string; // e.g. appointments
  action: string; // read | write | delete | manage
  description?: string | null;
}

export interface UserRole {
  id: UUID;
  userId: UUID;
  roleId: UUID;
  assignedAt: string; // ISO
  assignedBy?: string | null; // admin id
}

export interface RolePermission {
  id: UUID;
  roleId: UUID;
  permissionId: UUID;
  createdAt: string; // ISO
}

// Audit
export interface AuditLog {
  id: UUID;
  userId: UUID;
  clinicId?: UUID | null;
  userEmail?: string | null;
  userRole?: string | null;
  action: string; // CREATE, UPDATE, LOGIN, etc.
  resource: string; // PATIENT, APPOINTMENT, etc.
  resourceId?: UUID | null;
  details?: string | null; // JSON string
  ipAddress?: string | null;
  userAgent?: string | null;
  success: boolean;
  errorMessage?: string | null;
  timestamp: string; // ISO
}

// Documents
export interface Document {
  id: UUID;
  clinicId: UUID;
  name: string;
  type: DocumentType;
  s3Key: string;
  mimeType: string;
  size: number;
  status: DocumentStatus;
  reviewedBy?: string | null;
  reviewedAt?: string | null; // ISO
  rejectionReason?: string | null;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}
