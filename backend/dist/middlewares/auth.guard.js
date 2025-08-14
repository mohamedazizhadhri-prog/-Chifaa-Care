"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authGuard = void 0;
const jwt_1 = require("../utils/jwt");
const authGuard = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access token is required',
            });
        }
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        try {
            const decoded = jwt_1.JWT.verifyAccessToken(token);
            req.user = decoded;
            next();
        }
        catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired access token',
            });
        }
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Authentication error',
        });
    }
};
exports.authGuard = authGuard;
//# sourceMappingURL=auth.guard.js.map