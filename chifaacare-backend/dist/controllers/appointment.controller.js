"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAppointment = exports.updateAppointmentStatus = exports.getAppointments = exports.createAppointment = void 0;
const client_1 = require("@prisma/client");
const express_validator_1 = require("express-validator");
const appointment_1 = require("../types/appointment");
const prisma = new client_1.PrismaClient();
const createAppointment = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { doctorId, appointmentDate, endTime, reason, notes } = req.body;
        const patientId = req.user.id;
        // Check if doctor exists
        const doctor = await prisma.user.findUnique({
            where: { id: doctorId, role: 'DOCTOR' },
        });
        if (!doctor) {
            return res.status(404).json({
                status: 'error',
                message: 'Doctor not found',
            });
        }
        // Check for time conflicts
        const conflictingAppointment = await prisma.appointment.findFirst({
            where: {
                doctorId,
                appointmentDate: {
                    lte: endTime,
                },
                endTime: {
                    gte: appointmentDate,
                },
                status: {
                    in: [appointment_1.APPOINTMENT_STATUS.PENDING, appointment_1.APPOINTMENT_STATUS.CONFIRMED],
                },
            },
        });
        if (conflictingAppointment) {
            return res.status(400).json({
                status: 'error',
                message: 'The selected time slot is not available',
            });
        }
        const appointment = await prisma.appointment.create({
            data: {
                patientId,
                doctorId,
                appointmentDate: new Date(appointmentDate),
                endTime: new Date(endTime),
                reason,
                notes,
                status: 'PENDING',
            },
            include: {
                patient: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                doctor: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
        res.status(201).json({
            status: 'success',
            data: {
                appointment,
            },
        });
    }
    catch (error) {
        console.error('Create appointment error:', error);
        res.status(500).json({
            status: 'error',
            message: 'An error occurred while creating the appointment',
        });
    }
};
exports.createAppointment = createAppointment;
const getAppointments = async (req, res) => {
    try {
        const { status, startDate, endDate } = req.query;
        const userId = req.user.id;
        const userRole = req.user.role;
        const whereClause = {};
        // Filter based on user role
        if (userRole === 'PATIENT') {
            whereClause.patientId = userId;
        }
        else if (userRole === 'DOCTOR') {
            whereClause.doctorId = userId;
        }
        // Additional filters
        if (status) {
            whereClause.status = status;
        }
        if (startDate && endDate) {
            whereClause.OR = [
                {
                    appointmentDate: {
                        gte: new Date(startDate),
                        lte: new Date(endDate),
                    },
                },
                {
                    endTime: {
                        gte: new Date(startDate),
                        lte: new Date(endDate),
                    },
                },
            ];
        }
        const appointments = await prisma.appointment.findMany({
            where: whereClause,
            include: {
                patient: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                    },
                },
                doctor: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                appointmentDate: 'asc',
            },
        });
        res.status(200).json({
            status: 'success',
            results: appointments.length,
            data: {
                appointments,
            },
        });
    }
    catch (error) {
        console.error('Get appointments error:', error);
        res.status(500).json({
            status: 'error',
            message: 'An error occurred while fetching appointments',
        });
    }
};
exports.getAppointments = getAppointments;
const updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        // Validate status
        if (!(0, appointment_1.isValidAppointmentStatus)(status)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid status value. Must be one of: ' + Object.values(appointment_1.APPOINTMENT_STATUS).join(', '),
            });
        }
        const appointment = await prisma.appointment.findUnique({
            where: { id },
        });
        if (!appointment) {
            return res.status(404).json({
                status: 'error',
                message: 'Appointment not found',
            });
        }
        // Check if user has permission to update this appointment
        if (appointment.doctorId !== req.user.id &&
            appointment.patientId !== req.user.id &&
            req.user.role !== 'ADMIN') {
            return res.status(403).json({
                status: 'error',
                message: 'You do not have permission to update this appointment',
            });
        }
        const updatedAppointment = await prisma.appointment.update({
            where: { id },
            data: { status },
            include: {
                patient: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                doctor: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
        res.status(200).json({
            status: 'success',
            data: {
                appointment: updatedAppointment,
            },
        });
    }
    catch (error) {
        console.error('Update appointment status error:', error);
        res.status(500).json({
            status: 'error',
            message: 'An error occurred while updating the appointment status',
        });
    }
};
exports.updateAppointmentStatus = updateAppointmentStatus;
const deleteAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await prisma.appointment.findUnique({
            where: { id },
        });
        if (!appointment) {
            return res.status(404).json({
                status: 'error',
                message: 'Appointment not found',
            });
        }
        // Only allow admin or the patient who created the appointment to delete it
        if (appointment.patientId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({
                status: 'error',
                message: 'You do not have permission to delete this appointment',
            });
        }
        await prisma.appointment.delete({
            where: { id },
        });
        res.status(204).json({
            status: 'success',
            data: null,
        });
    }
    catch (error) {
        console.error('Delete appointment error:', error);
        res.status(500).json({
            status: 'error',
            message: 'An error occurred while deleting the appointment',
        });
    }
};
exports.deleteAppointment = deleteAppointment;
