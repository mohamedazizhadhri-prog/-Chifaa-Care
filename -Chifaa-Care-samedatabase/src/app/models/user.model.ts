export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  profileImage?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  doctorProfile?: any; // Using any for now to avoid circular dependencies, will be replaced by DoctorProfile
  patientProfile?: any; // Using any for now, will be replaced by PatientProfile
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY'; // Added gender to User
}

export interface Patient extends User {
  role: 'PATIENT';
  bloodType?: string;
  allergies?: string; // Stored as JSON string
  medications?: string; // Stored as JSON string
}
