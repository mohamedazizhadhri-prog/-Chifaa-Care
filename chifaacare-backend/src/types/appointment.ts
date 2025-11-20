export const APPOINTMENT_STATUS = {
  PENDING: 'PENDING',
  RESERVED: 'RESERVED',  // Alternative status used in some parts of the system
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
  NO_SHOW: 'NO_SHOW',
  RESCHEDULED: 'RESCHEDULED',
} as const;

export type AppointmentStatus = typeof APPOINTMENT_STATUS[keyof typeof APPOINTMENT_STATUS];

export const isValidAppointmentStatus = (status: string): status is AppointmentStatus => {
  return Object.values(APPOINTMENT_STATUS).includes(status as AppointmentStatus);
};
