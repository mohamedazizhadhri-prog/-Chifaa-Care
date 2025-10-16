"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllPatients = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAllPatients = async (req, res, next) => {
    try {
        const patients = await prisma.user.findMany({
            where: { role: 'PATIENT' },
            include: { patientProfile: true },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json({
            status: 'success',
            results: patients.length,
            data: { patients },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllPatients = getAllPatients;
