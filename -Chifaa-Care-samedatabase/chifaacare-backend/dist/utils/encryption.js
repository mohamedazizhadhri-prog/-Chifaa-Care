"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt = encrypt;
exports.decrypt = decrypt;
exports.hashSensitiveData = hashSensitiveData;
exports.verifySensitiveData = verifySensitiveData;
exports.encryptObject = encryptObject;
exports.decryptObject = decryptObject;
exports.generateSecureToken = generateSecureToken;
exports.maskSensitiveData = maskSensitiveData;
const crypto_1 = __importDefault(require("crypto"));
/**
 * AES-256-GCM Encryption Utility for HIPAA/GDPR Compliance
 * Encrypts sensitive PII and medical data at rest
 */
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 64;
const KEY_LENGTH = 32;
/**
 * Derives encryption key from master key using PBKDF2
 */
function deriveKey(masterKey, salt) {
    return crypto_1.default.pbkdf2Sync(masterKey, salt, 100000, // iterations
    KEY_LENGTH, 'sha512');
}
/**
 * Encrypts sensitive data using AES-256-GCM
 * @param plaintext - Data to encrypt
 * @param masterKey - Master encryption key from environment
 * @returns Encrypted data with IV, salt, and auth tag
 */
function encrypt(plaintext, masterKey) {
    if (!plaintext)
        return plaintext;
    const key = masterKey || process.env.ENCRYPTION_KEY;
    if (!key) {
        throw new Error('ENCRYPTION_KEY not configured. Required for HIPAA/GDPR compliance.');
    }
    try {
        // Generate random salt and IV
        const salt = crypto_1.default.randomBytes(SALT_LENGTH);
        const iv = crypto_1.default.randomBytes(IV_LENGTH);
        // Derive encryption key
        const derivedKey = deriveKey(key, salt);
        // Create cipher
        const cipher = crypto_1.default.createCipheriv(ALGORITHM, derivedKey, iv);
        // Encrypt data
        let encrypted = cipher.update(plaintext, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        // Get authentication tag
        const authTag = cipher.getAuthTag();
        // Combine: salt:iv:authTag:encrypted
        const combined = Buffer.concat([
            salt,
            iv,
            authTag,
            Buffer.from(encrypted, 'hex')
        ]);
        return combined.toString('base64');
    }
    catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt sensitive data');
    }
}
/**
 * Decrypts AES-256-GCM encrypted data
 * @param encryptedData - Encrypted data string
 * @param masterKey - Master encryption key from environment
 * @returns Decrypted plaintext
 */
function decrypt(encryptedData, masterKey) {
    if (!encryptedData)
        return encryptedData;
    const key = masterKey || process.env.ENCRYPTION_KEY;
    if (!key) {
        throw new Error('ENCRYPTION_KEY not configured. Required for HIPAA/GDPR compliance.');
    }
    try {
        // Decode base64
        const combined = Buffer.from(encryptedData, 'base64');
        // Extract components
        const salt = combined.subarray(0, SALT_LENGTH);
        const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
        const authTag = combined.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);
        const encrypted = combined.subarray(SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);
        // Derive key
        const derivedKey = deriveKey(key, salt);
        // Create decipher
        const decipher = crypto_1.default.createDecipheriv(ALGORITHM, derivedKey, iv);
        decipher.setAuthTag(authTag);
        // Decrypt
        let decrypted = decipher.update(encrypted.toString('hex'), 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt sensitive data');
    }
}
/**
 * Hash sensitive data for comparison (one-way)
 * Used for SSN, passport numbers where we need to verify but not retrieve
 */
function hashSensitiveData(data) {
    if (!data)
        return data;
    const salt = crypto_1.default.randomBytes(16);
    const hash = crypto_1.default.pbkdf2Sync(data, salt, 100000, 64, 'sha512');
    return salt.toString('hex') + ':' + hash.toString('hex');
}
/**
 * Verify hashed sensitive data
 */
function verifySensitiveData(data, hashedData) {
    if (!data || !hashedData)
        return false;
    const [salt, originalHash] = hashedData.split(':');
    const hash = crypto_1.default.pbkdf2Sync(data, Buffer.from(salt, 'hex'), 100000, 64, 'sha512');
    return hash.toString('hex') === originalHash;
}
/**
 * Encrypt JSON object fields selectively
 */
function encryptObject(obj, fieldsToEncrypt) {
    const encrypted = { ...obj };
    for (const field of fieldsToEncrypt) {
        if (encrypted[field] && typeof encrypted[field] === 'string') {
            encrypted[field] = encrypt(encrypted[field]);
        }
    }
    return encrypted;
}
/**
 * Decrypt JSON object fields selectively
 */
function decryptObject(obj, fieldsToDecrypt) {
    const decrypted = { ...obj };
    for (const field of fieldsToDecrypt) {
        if (decrypted[field] && typeof decrypted[field] === 'string') {
            try {
                decrypted[field] = decrypt(decrypted[field]);
            }
            catch (error) {
                console.error(`Failed to decrypt field ${String(field)}:`, error);
                // Keep encrypted value if decryption fails
            }
        }
    }
    return decrypted;
}
/**
 * Generate secure random token for session IDs, API keys
 */
function generateSecureToken(length = 32) {
    return crypto_1.default.randomBytes(length).toString('hex');
}
/**
 * Mask sensitive data for logging (GDPR compliance)
 * Shows only first and last 2 characters
 */
function maskSensitiveData(data, visibleChars = 2) {
    if (!data || data.length <= visibleChars * 2) {
        return '***';
    }
    const start = data.substring(0, visibleChars);
    const end = data.substring(data.length - visibleChars);
    const masked = '*'.repeat(Math.max(data.length - visibleChars * 2, 3));
    return `${start}${masked}${end}`;
}
