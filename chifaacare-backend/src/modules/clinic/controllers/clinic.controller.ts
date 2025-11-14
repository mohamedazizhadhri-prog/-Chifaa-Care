import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  Param, 
  UseGuards, 
  UploadedFile, 
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Put,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/roles.enum';
import { GetUser } from '../../../auth/decorators/get-user.decorator';
import { ClinicService } from '../services/clinic.service';
import { CreateClinicDto } from '../dto/create-clinic.dto';
import { DocumentType } from '@prisma/client';

@ApiTags('clinic')
@Controller('clinics')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ClinicController {
  constructor(private readonly clinicService: ClinicService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.CLINIC_ADMIN)
  @ApiOperation({ summary: 'Create a new clinic' })
  @ApiResponse({ status: 201, description: 'Clinic created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden - User already has a clinic' })
  async createClinic(
    @Body() createClinicDto: CreateClinicDto,
    @GetUser() user: any,
  ) {
    return this.clinicService.createClinic(createClinicDto, user.id);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.CLINIC_ADMIN, UserRole.DOCTOR, UserRole.STAFF)
  @ApiOperation({ summary: 'Get clinic details' })
  @ApiResponse({ status: 200, description: 'Clinic details' })
  @ApiResponse({ status: 403, description: 'Forbidden - No access to this clinic' })
  @ApiResponse({ status: 404, description: 'Clinic not found' })
  async getClinic(@Param('id') id: string, @GetUser() user: any) {
    return this.clinicService.getClinic(id, user.id);
  }

  @Post(':id/documents')
  @Roles(UserRole.ADMIN, UserRole.CLINIC_ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a document for clinic onboarding' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        type: {
          type: 'string',
          enum: Object.values(DocumentType),
        },
      },
    },
  })
  async uploadDocument(
    @Param('id') clinicId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: '.(pdf|doc|docx|jpg|jpeg|png)' }),
        ],
      }),
    ) file: Express.Multer.File,
    @Body('type') type: DocumentType,
    @GetUser() user: any,
  ) {
    return this.clinicService.uploadDocument(clinicId, user.id, file, type);
  }

  @Post(':id/documents/complete')
  @Roles(UserRole.ADMIN, UserRole.CLINIC_ADMIN)
  @ApiOperation({ summary: 'Mark document upload as complete' })
  async completeDocumentUpload(
    @Param('id') clinicId: string,
    @GetUser() user: any,
  ) {
    return this.clinicService.completeDocumentUpload(clinicId, user.id);
  }

  @Post(':id/payment')
  @Roles(UserRole.ADMIN, UserRole.CLINIC_ADMIN)
  @ApiOperation({ summary: 'Process clinic onboarding payment' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        paymentMethodId: { type: 'string' },
      },
      required: ['paymentMethodId'],
    },
  })
  async processPayment(
    @Param('id') clinicId: string,
    @Body('paymentMethodId') paymentMethodId: string,
    @GetUser() user: any,
  ) {
    return this.clinicService.processPayment(clinicId, user.id, paymentMethodId);
  }

  @Post(':id/ehr-integration')
  @Roles(UserRole.ADMIN, UserRole.CLINIC_ADMIN)
  @ApiOperation({ summary: 'Set up EHR integration' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        system: { type: 'string' },
        apiKey: { type: 'string' },
        apiUrl: { type: 'string' },
      },
      required: ['system', 'apiKey', 'apiUrl'],
    },
  })
  async setupEhrIntegration(
    @Param('id') clinicId: string,
    @Body() ehrData: any,
    @GetUser() user: any,
  ) {
    return this.clinicService.setupEhrIntegration(clinicId, user.id, ehrData);
  }
}
