"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClinicService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ClinicService = class ClinicService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createClinic(data, userId) {
        // Check if user already has a clinic
        const existingClinic = await this.prisma.clinic.findFirst({
            where: { users: { some: { id: userId } } },
        });
        if (existingClinic) {
            throw new common_1.ForbiddenException('User already has an associated clinic');
        }
        // Create the clinic
        const clinic = await this.prisma.clinic.create({
            data: {
                ...data,
                status: 'PENDING',
                onboardingStep: 'REGISTRATION',
                users: {
                    connect: { id: userId },
                },
            },
        });
        // Update user's role to clinic admin
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                clinicRole: 'ADMIN',
            },
        });
        return clinic;
    }
    async getClinic(id, userId) {
        const clinic = await this.prisma.clinic.findUnique({
            where: { id },
            include: {
                users: true,
                documents: true,
                services: true,
            },
        });
        if (!clinic) {
            throw new common_1.NotFoundException('Clinic not found');
        }
        // Check if user has access to this clinic
        const hasAccess = clinic.users.some((user) => user.id === userId);
        if (!hasAccess) {
            throw new common_1.ForbiddenException('You do not have access to this clinic');
        }
        return clinic;
    }
    async updateOnboardingStep(clinicId, step, userId) {
        // Verify user has access to this clinic
        await this.verifyClinicAccess(clinicId, userId);
        return this.prisma.clinic.update({
            where: { id: clinicId },
            data: { onboardingStep: step },
        });
    }
    async uploadDocument(clinicId, userId, file, type) {
        await this.verifyClinicAccess(clinicId, userId);
        // In a real app, upload file to S3 and get the key
        const s3Key = `clinics/${clinicId}/documents/${Date.now()}-${file.originalname}`;
        // await s3.upload(...)
        return this.prisma.document.create({
            data: {
                clinicId,
                name: file.originalname,
                type,
                s3Key,
                mimeType: file.mimetype,
                size: file.size,
                status: 'PENDING',
            },
        });
    }
    async completeDocumentUpload(clinicId, userId) {
        await this.verifyClinicAccess(clinicId, userId);
        // Check if all required documents are uploaded
        const requiredDocs = [client_1.DocumentType.NDA, client_1.DocumentType.CONTRACT, client_1.DocumentType.LICENSE];
        const uploadedDocs = await this.prisma.document.findMany({
            where: { clinicId, type: { in: requiredDocs } },
        });
        const missingDocs = requiredDocs.filter((docType) => !uploadedDocs.some((doc) => doc.type === docType));
        if (missingDocs.length > 0) {
            throw new common_1.ForbiddenException(`Missing required documents: ${missingDocs.join(', ')}`);
        }
        // Move to next step
        return this.updateOnboardingStep(clinicId, 'PAYMENT', userId);
    }
    async processPayment(clinicId, userId, paymentMethodId) {
        await this.verifyClinicAccess(clinicId, userId);
        // In a real app, process payment with Stripe
        // const payment = await stripe.paymentIntents.create({...});
        // Update clinic status
        return this.prisma.clinic.update({
            where: { id: clinicId },
            data: {
                onboardingStep: 'EHR_INTEGRATION',
                // Store payment info
            },
        });
    }
    async setupEhrIntegration(clinicId, userId, ehrData) {
        await this.verifyClinicAccess(clinicId, userId);
        // In a real app, validate EHR credentials and test connection
        // const isValid = await testEhrConnection(ehrData);
        // if (!isValid) { ... }
        return this.prisma.clinic.update({
            where: { id: clinicId },
            data: {
                ehrSystem: ehrData.system,
                ehrApiKey: ehrData.apiKey, // Should be encrypted
                ehrApiUrl: ehrData.apiUrl,
                ehrConnected: true,
                onboardingStep: 'COMPLETED',
                status: 'ACTIVE',
            },
        });
    }
    async verifyClinicAccess(clinicId, userId) {
        const clinic = await this.prisma.clinic.findUnique({
            where: { id: clinicId },
            include: { users: true },
        });
        if (!clinic) {
            throw new common_1.NotFoundException('Clinic not found');
        }
        const hasAccess = clinic.users.some((user) => user.id === userId);
        if (!hasAccess) {
            throw new common_1.ForbiddenException('You do not have access to this clinic');
        }
    }
};
exports.ClinicService = ClinicService;
exports.ClinicService = ClinicService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClinicService);
