"use strict";
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
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClinicService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let ClinicService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ClinicService = _classThis = class {
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
    __setFunctionName(_classThis, "ClinicService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ClinicService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ClinicService = _classThis;
})();
exports.ClinicService = ClinicService;
