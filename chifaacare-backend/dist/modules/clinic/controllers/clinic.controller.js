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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClinicController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../../auth/decorators/roles.decorator");
const roles_enum_1 = require("../../../common/enums/roles.enum");
const get_user_decorator_1 = require("../../../auth/decorators/get-user.decorator");
const clinic_service_1 = require("../services/clinic.service");
const create_clinic_dto_1 = require("../dto/create-clinic.dto");
const client_1 = require("@prisma/client");
let ClinicController = class ClinicController {
    constructor(clinicService) {
        this.clinicService = clinicService;
    }
    async createClinic(createClinicDto, user) {
        return this.clinicService.createClinic(createClinicDto, user.id);
    }
    async getClinic(id, user) {
        return this.clinicService.getClinic(id, user.id);
    }
    async uploadDocument(clinicId, file, type, user) {
        return this.clinicService.uploadDocument(clinicId, user.id, file, type);
    }
    async completeDocumentUpload(clinicId, user) {
        return this.clinicService.completeDocumentUpload(clinicId, user.id);
    }
    async processPayment(clinicId, paymentMethodId, user) {
        return this.clinicService.processPayment(clinicId, user.id, paymentMethodId);
    }
    async setupEhrIntegration(clinicId, ehrData, user) {
        return this.clinicService.setupEhrIntegration(clinicId, user.id, ehrData);
    }
};
exports.ClinicController = ClinicController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN, roles_enum_1.UserRole.CLINIC_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new clinic' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Clinic created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - User already has a clinic' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_clinic_dto_1.CreateClinicDto, Object]),
    __metadata("design:returntype", Promise)
], ClinicController.prototype, "createClinic", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN, roles_enum_1.UserRole.CLINIC_ADMIN, roles_enum_1.UserRole.DOCTOR, roles_enum_1.UserRole.STAFF),
    (0, swagger_1.ApiOperation)({ summary: 'Get clinic details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Clinic details' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - No access to this clinic' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Clinic not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ClinicController.prototype, "getClinic", null);
__decorate([
    (0, common_1.Post)(':id/documents'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN, roles_enum_1.UserRole.CLINIC_ADMIN),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiOperation)({ summary: 'Upload a document for clinic onboarding' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
                type: {
                    type: 'string',
                    enum: Object.values(client_1.DocumentType),
                },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
            new common_1.FileTypeValidator({ fileType: '.(pdf|doc|docx|jpg|jpeg|png)' }),
        ],
    }))),
    __param(2, (0, common_1.Body)('type')),
    __param(3, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, Object]),
    __metadata("design:returntype", Promise)
], ClinicController.prototype, "uploadDocument", null);
__decorate([
    (0, common_1.Post)(':id/documents/complete'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN, roles_enum_1.UserRole.CLINIC_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Mark document upload as complete' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ClinicController.prototype, "completeDocumentUpload", null);
__decorate([
    (0, common_1.Post)(':id/payment'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN, roles_enum_1.UserRole.CLINIC_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Process clinic onboarding payment' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                paymentMethodId: { type: 'string' },
            },
            required: ['paymentMethodId'],
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('paymentMethodId')),
    __param(2, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ClinicController.prototype, "processPayment", null);
__decorate([
    (0, common_1.Post)(':id/ehr-integration'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN, roles_enum_1.UserRole.CLINIC_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Set up EHR integration' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                system: { type: 'string' },
                apiKey: { type: 'string' },
                apiUrl: { type: 'string' },
            },
            required: ['system', 'apiKey', 'apiUrl'],
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ClinicController.prototype, "setupEhrIntegration", null);
exports.ClinicController = ClinicController = __decorate([
    (0, swagger_1.ApiTags)('clinic'),
    (0, common_1.Controller)('clinics'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [clinic_service_1.ClinicService])
], ClinicController);
