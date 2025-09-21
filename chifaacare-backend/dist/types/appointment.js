"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidAppointmentStatus = exports.APPOINTMENT_STATUS = void 0;
exports.APPOINTMENT_STATUS = {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    CANCELLED: 'CANCELLED',
    COMPLETED: 'COMPLETED',
    NO_SHOW: 'NO_SHOW',
    RESCHEDULED: 'RESCHEDULED',
};
const isValidAppointmentStatus = (status) => {
    return Object.values(exports.APPOINTMENT_STATUS).includes(status);
};
exports.isValidAppointmentStatus = isValidAppointmentStatus;
