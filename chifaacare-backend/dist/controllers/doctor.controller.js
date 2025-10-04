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
            },
        });
        res.status(200).json({
            status: 'success',
            results: doctors.length,
            data: {
                doctors,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllDoctors = getAllDoctors;
