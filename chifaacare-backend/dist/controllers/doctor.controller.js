"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllDoctors = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAllDoctors = async (req, res, next) => {
    try {
        const doctors = await prisma.user.findMany({
            where: {
                role: 'DOCTOR',
            },
            include: {
                doctorProfile: {
                    include: {
                        education: true,
                    },
                },
                clinic: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        // Add friendly display name used by the chat UI: "Dr. Name - Clinic"
        // Handle cases where doctorProfile might be null
        const doctorsWithClinic = doctors.map((d) => ({
            ...d,
            displayName: `Dr. ${d.firstName} ${d.lastName}${d.clinic ? ` - ${d.clinic.name}` : ''}`,
            // Ensure doctorProfile exists with defaults if null
            doctorProfile: d.doctorProfile || {
                id: '',
                userId: d.id,
                specialization: 'General Practitioner',
                bio: null,
                licenseNumber: null,
                experience: 0,
                consultationFee: null,
                availableDays: '[]',
                availableHours: '[]',
                languages: '[]',
                createdAt: d.createdAt,
                updatedAt: d.updatedAt,
                education: []
            }
        }));
        res.status(200).json({
            status: 'success',
            results: doctors.length,
            data: {
                doctors: doctorsWithClinic,
            },
        });
    }
    catch (error) {
        console.error('Error in getAllDoctors:', error);
        next(error);
    }
};
exports.getAllDoctors = getAllDoctors;
