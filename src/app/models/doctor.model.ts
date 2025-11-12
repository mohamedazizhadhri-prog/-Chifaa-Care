import { User } from './user.model';

export interface DoctorProfile {
  id: string;
  userId: string;
  specialization?: string;
  bio?: string;
  licenseNumber?: string;
  experience?: number;
  consultationFee?: number;
  availableDays: string; // Stored as JSON string
  availableHours: string; // Stored as JSON string
  languages: string; // Stored as JSON string
  rating?: number;
  reviewCount?: number;
  education?: Education[];
  hospital?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Education {
  id: string;
  doctorProfileId: string;
  degree: string;
  institution: string;
  fieldOfStudy: string;
  startYear: number;
  endYear?: number;
  description?: string;
}

// Extend User to include doctorProfile when role is DOCTOR
export interface Doctor extends User {
  role: 'DOCTOR';
  doctorProfile?: DoctorProfile;
}

// This type is used when fetching a User with their DoctorProfile included
export type DoctorUser = User & { doctorProfile: DoctorProfile | null };
