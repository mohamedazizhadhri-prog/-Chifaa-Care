"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
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
const client_1 = require("@prisma/client");
let ClinicController = (() => {
    let _classDecorators = [(0, swagger_1.ApiTags)('clinic'), (0, common_1.Controller)('clinics'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard), (0, swagger_1.ApiBearerAuth)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _createClinic_decorators;
    let _getClinic_decorators;
    let _uploadDocument_decorators;
    let _completeDocumentUpload_decorators;
    let _processPayment_decorators;
    let _setupEhrIntegration_decorators;
    var ClinicController = _classThis = class {
        constructor(clinicService) {
            this.clinicService = (__runInitializers(this, _instanceExtraInitializers), clinicService);
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
    __setFunctionName(_classThis, "ClinicController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _createClinic_decorators = [(0, common_1.Post)(), (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN, roles_enum_1.UserRole.CLINIC_ADMIN), (0, swagger_1.ApiOperation)({ summary: 'Create a new clinic' }), (0, swagger_1.ApiResponse)({ status: 201, description: 'Clinic created successfully' }), (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }), (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - User already has a clinic' })];
        _getClinic_decorators = [(0, common_1.Get)(':id'), (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN, roles_enum_1.UserRole.CLINIC_ADMIN, roles_enum_1.UserRole.PROVIDER, roles_enum_1.UserRole.STAFF), (0, swagger_1.ApiOperation)({ summary: 'Get clinic details' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Clinic details' }), (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - No access to this clinic' }), (0, swagger_1.ApiResponse)({ status: 404, description: 'Clinic not found' })];
        _uploadDocument_decorators = [(0, common_1.Post)(':id/documents'), (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN, roles_enum_1.UserRole.CLINIC_ADMIN), (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')), (0, swagger_1.ApiOperation)({ summary: 'Upload a document for clinic onboarding' }), (0, swagger_1.ApiConsumes)('multipart/form-data'), (0, swagger_1.ApiBody)({
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
            })];
        _completeDocumentUpload_decorators = [(0, common_1.Post)(':id/documents/complete'), (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN, roles_enum_1.UserRole.CLINIC_ADMIN), (0, swagger_1.ApiOperation)({ summary: 'Mark document upload as complete' })];
        _processPayment_decorators = [(0, common_1.Post)(':id/payment'), (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN, roles_enum_1.UserRole.CLINIC_ADMIN), (0, swagger_1.ApiOperation)({ summary: 'Process clinic onboarding payment' }), (0, swagger_1.ApiBody)({
                schema: {
                    type: 'object',
                    properties: {
                        paymentMethodId: { type: 'string' },
                    },
                    required: ['paymentMethodId'],
                },
            })];
        _setupEhrIntegration_decorators = [(0, common_1.Post)(':id/ehr-integration'), (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.ADMIN, roles_enum_1.UserRole.CLINIC_ADMIN), (0, swagger_1.ApiOperation)({ summary: 'Set up EHR integration' }), (0, swagger_1.ApiBody)({
                schema: {
                    type: 'object',
                    properties: {
                        system: { type: 'string' },
                        apiKey: { type: 'string' },
                        apiUrl: { type: 'string' },
                    },
                    required: ['system', 'apiKey', 'apiUrl'],
                },
            })];
        __esDecorate(_classThis, null, _createClinic_decorators, { kind: "method", name: "createClinic", static: false, private: false, access: { has: obj => "createClinic" in obj, get: obj => obj.createClinic }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getClinic_decorators, { kind: "method", name: "getClinic", static: false, private: false, access: { has: obj => "getClinic" in obj, get: obj => obj.getClinic }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _uploadDocument_decorators, { kind: "method", name: "uploadDocument", static: false, private: false, access: { has: obj => "uploadDocument" in obj, get: obj => obj.uploadDocument }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _completeDocumentUpload_decorators, { kind: "method", name: "completeDocumentUpload", static: false, private: false, access: { has: obj => "completeDocumentUpload" in obj, get: obj => obj.completeDocumentUpload }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _processPayment_decorators, { kind: "method", name: "processPayment", static: false, private: false, access: { has: obj => "processPayment" in obj, get: obj => obj.processPayment }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _setupEhrIntegration_decorators, { kind: "method", name: "setupEhrIntegration", static: false, private: false, access: { has: obj => "setupEhrIntegration" in obj, get: obj => obj.setupEhrIntegration }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ClinicController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ClinicController = _classThis;
})();
exports.ClinicController = ClinicController;
