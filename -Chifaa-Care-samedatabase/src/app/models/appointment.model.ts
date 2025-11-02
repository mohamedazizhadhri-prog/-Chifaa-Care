export enum ConsultationType {
  VIDEO = 'VIDEO',
  IN_PERSON = 'IN_PERSON',
  PHONE = 'PHONE'
}
export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'REJECTED';

/**
 * Base appointment interface that matches the backend model
 */
export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: string; // ISO date string
  endTime: string; // ISO time string
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  diagnosis?: string;
  prescription?: string;
  followUpDate?: string; // ISO date string
  isFollowUp: boolean;
  originalAppointmentId?: string; // For follow-up appointments
  consultationType: ConsultationType;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  // Additional metadata that might come from the backend
  metadata?: {
    videoCallUrl?: string;
    cancellationReason?: string;
    rescheduledFrom?: string; // Original appointment date if this is a reschedule
  };
}

/**
 * Extended appointment with related data for display purposes
 */
export interface AppointmentWithRelations extends Appointment {
  doctor: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    profileImage?: string; // Changed from avatar
    doctorProfile?: {
      id: string;
      specialization: string;
      bio?: string;
      experience?: number;
      consultationFee?: number;
      languages?: string; // Changed from string[]
      hospital?: string;
      rating?: number;
      reviewCount?: number;
    };
  };
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    dateOfBirth?: string;
  };
}

/**
 * Data required to create a new appointment
 */
export interface CreateAppointmentData {
  patientId: string;
  doctorId: string;
  appointmentDate: string; // ISO date string
  endTime: string; // ISO time string
  reason: string;
  notes?: string;
  consultationType: ConsultationType;
  isFollowUp?: boolean;
  originalAppointmentId?: string;
}

/**
 * Data required to update an existing appointment
 */
export interface UpdateAppointmentData {
  appointmentDate?: string; // ISO date string
  endTime?: string; // ISO time string
  status?: AppointmentStatus;
  reason?: string;
  notes?: string;
  diagnosis?: string;
  prescription?: string;
  followUpDate?: string; // ISO date string
  consultationType?: ConsultationType;
  metadata?: {
    videoCallUrl?: string;
    cancellationReason?: string;
    rescheduledFrom?: string; // Original appointment date if this is a reschedule
  };
}
