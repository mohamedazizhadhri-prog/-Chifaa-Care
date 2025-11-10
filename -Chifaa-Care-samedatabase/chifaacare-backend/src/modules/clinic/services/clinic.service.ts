import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateClinicDto } from '../dto/create-clinic.dto';
import { OnboardingStep, ClinicStatus, DocumentType, DocumentStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class ClinicService {
  constructor(private prisma: PrismaService) {}

  async createClinic(data: CreateClinicDto, userId: string) {
    // Check if user already has a clinic
    const existingClinic = await this.prisma.clinic.findFirst({
      where: { users: { some: { id: userId } } },
    });

    if (existingClinic) {
      throw new ForbiddenException('User already has an associated clinic');
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

  async getClinic(id: string, userId: string) {
    const clinic = await this.prisma.clinic.findUnique({
      where: { id },
      include: {
        users: true,
        documents: true,
        services: true,
      },
    });

    if (!clinic) {
      throw new NotFoundException('Clinic not found');
    }

    // Check if user has access to this clinic
    const hasAccess = clinic.users.some((user) => user.id === userId);
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this clinic');
    }

    return clinic;
  }

  async updateOnboardingStep(clinicId: string, step: OnboardingStep, userId: string) {
    // Verify user has access to this clinic
    await this.verifyClinicAccess(clinicId, userId);

    return this.prisma.clinic.update({
      where: { id: clinicId },
      data: { onboardingStep: step },
    });
  }

  async uploadDocument(
    clinicId: string,
    userId: string,
    file: Express.Multer.File,
    type: DocumentType,
  ) {
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

  async completeDocumentUpload(clinicId: string, userId: string) {
    await this.verifyClinicAccess(clinicId, userId);

    // Check if all required documents are uploaded
    const requiredDocs = [DocumentType.NDA, DocumentType.CONTRACT, DocumentType.LICENSE];
    const uploadedDocs = await this.prisma.document.findMany({
      where: { clinicId, type: { in: requiredDocs } },
    });

    const missingDocs = requiredDocs.filter(
      (docType) => !uploadedDocs.some((doc) => doc.type === docType),
    );

    if (missingDocs.length > 0) {
      throw new ForbiddenException(`Missing required documents: ${missingDocs.join(', ')}`);
    }

    // Move to next step
    return this.updateOnboardingStep(clinicId, 'PAYMENT', userId);
  }

  async processPayment(clinicId: string, userId: string, paymentMethodId: string) {
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

  async setupEhrIntegration(clinicId: string, userId: string, ehrData: any) {
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

  private async verifyClinicAccess(clinicId: string, userId: string) {
    const clinic = await this.prisma.clinic.findUnique({
      where: { id: clinicId },
      include: { users: true },
    });

    if (!clinic) {
      throw new NotFoundException('Clinic not found');
    }

    const hasAccess = clinic.users.some((user) => user.id === userId);
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this clinic');
    }
  }
}
