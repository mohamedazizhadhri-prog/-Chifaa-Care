"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptSensitiveFields = encryptSensitiveFields;
exports.decryptSensitiveFields = decryptSensitiveFields;
exports.createPrismaEncryptionMiddleware = createPrismaEncryptionMiddleware;
const encryption_1 = require("../utils/encryption");
/**
 * Middleware to automatically encrypt sensitive fields before saving to database
 * and decrypt when retrieving from database
 */
// Fields that should be encrypted for HIPAA/GDPR compliance
const SENSITIVE_FIELDS = {
    PatientProfile: ['allergies', 'medications', 'medicalHistory', 'emergencyContact'],
    MedicalRecord: ['diagnosis', 'symptoms', 'notes', 'labResults'],
    Prescription: ['instructions', 'notes'],
    TreatmentPlan: ['goals', 'notes'],
    Message: ['content'], // Encrypt message content for privacy
    User: ['phone'] // Encrypt phone numbers
};
/**
 * Encrypt sensitive fields in request body before database write
 */
function encryptSensitiveFields(modelName) {
    return (req, res, next) => {
        try {
            const fieldsToEncrypt = SENSITIVE_FIELDS[modelName];
            if (!fieldsToEncrypt || !req.body) {
                return next();
            }
            // Encrypt specified fields in request body
            for (const field of fieldsToEncrypt) {
                if (req.body[field] && typeof req.body[field] === 'string') {
                    req.body[field] = (0, encryption_1.encrypt)(req.body[field]);
                }
                // Handle nested objects (e.g., create operations with nested data)
                if (req.body.data && req.body.data[field] && typeof req.body.data[field] === 'string') {
                    req.body.data[field] = (0, encryption_1.encrypt)(req.body.data[field]);
                }
            }
            next();
        }
        catch (error) {
            console.error('Encryption middleware error:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to encrypt sensitive data'
            });
        }
    };
}
/**
 * Decrypt sensitive fields in response before sending to client
 */
function decryptSensitiveFields(modelName) {
    return (req, res, next) => {
        try {
            const fieldsToDecrypt = SENSITIVE_FIELDS[modelName];
            if (!fieldsToDecrypt) {
                return next();
            }
            // Store original json method
            const originalJson = res.json.bind(res);
            // Override json method to decrypt before sending
            res.json = function (data) {
                try {
                    // Decrypt single object
                    if ((data === null || data === void 0 ? void 0 : data.data) && typeof data.data === 'object' && !Array.isArray(data.data)) {
                        for (const field of fieldsToDecrypt) {
                            if (data.data[field] && typeof data.data[field] === 'string') {
                                try {
                                    data.data[field] = (0, encryption_1.decrypt)(data.data[field]);
                                }
                                catch (err) {
                                    // If decryption fails, field might not be encrypted
                                    console.warn(`Failed to decrypt field ${field}, keeping original value`);
                                }
                            }
                        }
                    }
                    // Decrypt array of objects
                    if ((data === null || data === void 0 ? void 0 : data.data) && Array.isArray(data.data)) {
                        data.data = data.data.map((item) => {
                            if (typeof item === 'object') {
                                for (const field of fieldsToDecrypt) {
                                    if (item[field] && typeof item[field] === 'string') {
                                        try {
                                            item[field] = (0, encryption_1.decrypt)(item[field]);
                                        }
                                        catch (err) {
                                            console.warn(`Failed to decrypt field ${field}, keeping original value`);
                                        }
                                    }
                                }
                            }
                            return item;
                        });
                    }
                }
                catch (error) {
                    console.error('Decryption error in response:', error);
                    // Continue with original data if decryption fails
                }
                return originalJson(data);
            };
            next();
        }
        catch (error) {
            console.error('Decryption middleware error:', error);
            next();
        }
    };
}
/**
 * Prisma middleware to automatically encrypt/decrypt at ORM level
 * Add this to your Prisma client initialization
 */
function createPrismaEncryptionMiddleware() {
    return async (params, next) => {
        const { model, action, args } = params;
        // Encrypt on create/update
        if ((action === 'create' || action === 'update' || action === 'upsert') && model) {
            const fieldsToEncrypt = SENSITIVE_FIELDS[model];
            if (fieldsToEncrypt && args.data) {
                for (const field of fieldsToEncrypt) {
                    if (args.data[field] && typeof args.data[field] === 'string') {
                        args.data[field] = (0, encryption_1.encrypt)(args.data[field]);
                    }
                }
            }
        }
        // Execute query
        const result = await next(params);
        // Decrypt on read
        if ((action === 'findUnique' || action === 'findFirst' || action === 'findMany') && model) {
            const fieldsToDecrypt = SENSITIVE_FIELDS[model];
            if (fieldsToDecrypt && result) {
                if (Array.isArray(result)) {
                    // Decrypt array of results
                    result.forEach((item) => {
                        for (const field of fieldsToDecrypt) {
                            if (item[field] && typeof item[field] === 'string') {
                                try {
                                    item[field] = (0, encryption_1.decrypt)(item[field]);
                                }
                                catch (err) {
                                    // Keep original if decryption fails
                                }
                            }
                        }
                    });
                }
                else {
                    // Decrypt single result
                    for (const field of fieldsToDecrypt) {
                        if (result[field] && typeof result[field] === 'string') {
                            try {
                                result[field] = (0, encryption_1.decrypt)(result[field]);
                            }
                            catch (err) {
                                // Keep original if decryption fails
                            }
                        }
                    }
                }
            }
        }
        return result;
    };
}
