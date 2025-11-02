import { User, Patient } from '../models/user.model';
import { DoctorProfile, Doctor, Education } from '../models/doctor.model';
import { Appointment, ConsultationType } from '../models/appointment.model';

// Helper to safely parse JSON strings that might be empty or invalid
export function safeJsonParse<T>(jsonString: string | null | undefined, defaultValue: T): T {
  if (!jsonString) return defaultValue;
  try {
    const parsed = JSON.parse(jsonString);
    return parsed;
  } catch (e) {
    console.error('Error parsing JSON string:', jsonString, e);
    return defaultValue;
  }
}

export function mapAuthUserToUser(authUser: any): User {
  const user: User = {
    id: authUser.id,
    email: authUser.email,
    firstName: authUser.firstName,
    lastName: authUser.lastName,
    phone: authUser.phone,
    role: authUser.role,
    profileImage: authUser.profileImage,
    isEmailVerified: authUser.isEmailVerified,
    isActive: authUser.isActive,
    lastLogin: authUser.lastLogin,
    createdAt: authUser.createdAt,
    updatedAt: authUser.updatedAt,
    gender: authUser.gender,
  };

  if (authUser.role === 'DOCTOR' && authUser.doctorProfile) {
    user.doctorProfile = mapAuthDoctorProfileToDoctorProfile(authUser.doctorProfile);
  }
  if (authUser.role === 'PATIENT' && authUser.patientProfile) {
    user.patientProfile = mapAuthPatientProfileToPatientProfile(authUser.patientProfile);
  }

  return user;
}

export function mapAuthDoctorProfileToDoctorProfile(authDoctorProfile: any): DoctorProfile {
  return {
    id: authDoctorProfile.id,
    userId: authDoctorProfile.userId,
    specialization: authDoctorProfile.specialization,
    bio: authDoctorProfile.bio,
    licenseNumber: authDoctorProfile.licenseNumber,
    experience: authDoctorProfile.experience,
    consultationFee: authDoctorProfile.consultationFee,
    // These are stored as JSON strings in DB, so ensure they are strings here
    availableDays: JSON.stringify(authDoctorProfile.availableDays || []), // Ensure it's a string
    availableHours: JSON.stringify(authDoctorProfile.availableHours || []), // Ensure it's a string
    languages: JSON.stringify(authDoctorProfile.languages || []), // Ensure it's a string
    rating: authDoctorProfile.rating,
    reviewCount: authDoctorProfile.reviewCount,
    education: authDoctorProfile.education ? authDoctorProfile.education.map((edu: any) => mapAuthEducationToEducation(edu)) : [],
    hospital: authDoctorProfile.hospital,
    createdAt: authDoctorProfile.createdAt,
    updatedAt: authDoctorProfile.updatedAt,
  };
}

export function mapAuthEducationToEducation(authEducation: any): Education {
  return {
    id: authEducation.id,
    doctorProfileId: authEducation.doctorProfileId,
    degree: authEducation.degree,
    institution: authEducation.institution,
    fieldOfStudy: authEducation.fieldOfStudy,
    startYear: authEducation.startYear,
    endYear: authEducation.endYear,
    description: authEducation.description,
  };
}

export function mapAuthPatientProfileToPatientProfile(authPatientProfile: any): Patient {
  const patient: Patient = {
    id: authPatientProfile.id,
    email: authPatientProfile.email,
    firstName: authPatientProfile.firstName,
    lastName: authPatientProfile.lastName,
    phone: authPatientProfile.phone,
    role: 'PATIENT',
    profileImage: authPatientProfile.profileImage,
    isEmailVerified: authPatientProfile.isEmailVerified,
    isActive: authPatientProfile.isActive,
    lastLogin: authPatientProfile.lastLogin,
    createdAt: authPatientProfile.createdAt,
    updatedAt: authPatientProfile.updatedAt,
    gender: authPatientProfile.gender,
    bloodType: authPatientProfile.bloodType,
    allergies: JSON.stringify(authPatientProfile.allergies || []), // Ensure it's a string
    medications: JSON.stringify(authPatientProfile.medications || []), // Ensure it's a string
  };
  return patient;
}

export function mapAuthAppointmentToAppointment(authAppointment: any): Appointment {
  return {
    id: authAppointment.id,
    patientId: authAppointment.patientId,
    doctorId: authAppointment.doctorId,
    appointmentDate: authAppointment.appointmentDate,
    endTime: authAppointment.endTime,
    status: authAppointment.status,
    reason: authAppointment.reason,
    notes: authAppointment.notes,
    diagnosis: authAppointment.diagnosis,
    prescription: authAppointment.prescription,
    followUpDate: authAppointment.followUpDate,
    isFollowUp: authAppointment.isFollowUp,
    originalAppointmentId: authAppointment.originalAppointmentId,
    createdAt: authAppointment.createdAt,
    updatedAt: authAppointment.updatedAt,
    consultationType: authAppointment.consultationType as ConsultationType, // Ensure type consistency
  };
}