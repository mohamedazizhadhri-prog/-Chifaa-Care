"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const notification_controller_1 = require("../controllers/notification.controller");
const router = express_1.default.Router();
// All routes require authentication
router.use(auth_controller_1.protect);
// Subscription management
router.post('/subscribe', notification_controller_1.subscribe);
router.post('/unsubscribe', notification_controller_1.unsubscribe);
// Send notifications
router.post('/send', notification_controller_1.sendNotification);
router.post('/send-bulk', notification_controller_1.sendBulkNotification);
// Notification history
router.get('/', notification_controller_1.getNotifications);
router.patch('/:id/read', notification_controller_1.markAsRead);
router.patch('/read-all', notification_controller_1.markAllAsRead);
router.delete('/:id', notification_controller_1.deleteNotification);
exports.default = router;
