"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT = void 0;
const config_1 = require("../config");
// Use require to bypass TypeScript type issues
const jwt = require('jsonwebtoken');
class JWT {
    static generateAccessToken(payload) {
        return jwt.sign(payload, config_1.config.jwt.accessSecret, {
            expiresIn: config_1.config.jwt.accessExpiresIn
        });
    }
    static generateRefreshToken(payload) {
        return jwt.sign(payload, config_1.config.jwt.refreshSecret, {
            expiresIn: config_1.config.jwt.refreshExpiresIn
        });
    }
    static verifyAccessToken(token) {
        try {
            return jwt.verify(token, config_1.config.jwt.accessSecret);
        }
        catch (error) {
            throw new Error('Invalid access token');
        }
    }
    static verifyRefreshToken(token) {
        try {
            return jwt.verify(token, config_1.config.jwt.refreshSecret);
        }
        catch (error) {
            throw new Error('Invalid refresh token');
        }
    }
}
exports.JWT = JWT;
//# sourceMappingURL=jwt.js.map