"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_guard_1 = require("../middlewares/auth.guard");
const router = (0, express_1.Router)();
// Public routes
router.post('/signup', auth_controller_1.AuthController.signup);
router.post('/login', auth_controller_1.AuthController.login);
router.post('/refresh', auth_controller_1.AuthController.refreshToken);
router.post('/logout', auth_controller_1.AuthController.logout);
// Protected routes
router.get('/profile', auth_guard_1.authGuard, auth_controller_1.AuthController.getProfile);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map