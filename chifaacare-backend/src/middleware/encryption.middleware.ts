import { Request, Response, NextFunction } from 'express';
import { encrypt, decrypt, encryptObject, decryptObject } from '../utils/encryption';

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
export function encryptSensitiveFields(modelName: keyof typeof SENSITIVE_FIELDS) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const fieldsToEncrypt = SENSITIVE_FIELDS[modelName];
      
      if (!fieldsToEncrypt || !req.body) {
        return next();
      }

      // Encrypt specified fields in request body
      for (const field of fieldsToEncrypt) {
        if (req.body[field] && typeof req.body[field] === 'string') {
          req.body[field] = encrypt(req.body[field]);
        }
        
        // Handle nested objects (e.g., create operations with nested data)
        if (req.body.data && req.body.data[field] && typeof req.body.data[field] === 'string') {
          req.body.data[field] = encrypt(req.body.data[field]);
        }
      }

      next();
    } catch (error) {
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
export function decryptSensitiveFields(modelName: keyof typeof SENSITIVE_FIELDS) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const fieldsToDecrypt = SENSITIVE_FIELDS[modelName];
      
      if (!fieldsToDecrypt) {
        return next();
      }

      // Store original json method
      const originalJson = res.json.bind(res);

      // Override json method to decrypt before sending
      res.json = function (data: any) {
        try {
          // Decrypt single object
          if (data?.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
            for (const field of fieldsToDecrypt) {
              if (data.data[field] && typeof data.data[field] === 'string') {
                try {
                  data.data[field] = decrypt(data.data[field]);
                } catch (err) {
                  // If decryption fails, field might not be encrypted
                  console.warn(`Failed to decrypt field ${field}, keeping original value`);
                }
              }
            }
          }

          // Decrypt array of objects
          if (data?.data && Array.isArray(data.data)) {
            data.data = data.data.map((item: any) => {
              if (typeof item === 'object') {
                for (const field of fieldsToDecrypt) {
                  if (item[field] && typeof item[field] === 'string') {
                    try {
                      item[field] = decrypt(item[field]);
                    } catch (err) {
                      console.warn(`Failed to decrypt field ${field}, keeping original value`);
                    }
                  }
                }
              }
              return item;
            });
          }
        } catch (error) {
          console.error('Decryption error in response:', error);
          // Continue with original data if decryption fails
        }

        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Decryption middleware error:', error);
      next();
    }
  };
}

/**
 * Prisma middleware to automatically encrypt/decrypt at ORM level
 * Add this to your Prisma client initialization
 */
export function createPrismaEncryptionMiddleware() {
  return async (params: any, next: any) => {
    const { model, action, args } = params;

    // Encrypt on create/update
    if ((action === 'create' || action === 'update' || action === 'upsert') && model) {
      const fieldsToEncrypt = SENSITIVE_FIELDS[model as keyof typeof SENSITIVE_FIELDS];
      
      if (fieldsToEncrypt && args.data) {
        for (const field of fieldsToEncrypt) {
          if (args.data[field] && typeof args.data[field] === 'string') {
            args.data[field] = encrypt(args.data[field]);
          }
        }
      }
    }

    // Execute query
    const result = await next(params);

    // Decrypt on read
    if ((action === 'findUnique' || action === 'findFirst' || action === 'findMany') && model) {
      const fieldsToDecrypt = SENSITIVE_FIELDS[model as keyof typeof SENSITIVE_FIELDS];
      
      if (fieldsToDecrypt && result) {
        if (Array.isArray(result)) {
          // Decrypt array of results
          result.forEach((item: any) => {
            for (const field of fieldsToDecrypt) {
              if (item[field] && typeof item[field] === 'string') {
                try {
                  item[field] = decrypt(item[field]);
                } catch (err) {
                  // Keep original if decryption fails
                }
              }
            }
          });
        } else {
          // Decrypt single result
          for (const field of fieldsToDecrypt) {
            if (result[field] && typeof result[field] === 'string') {
              try {
                result[field] = decrypt(result[field]);
              } catch (err) {
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
