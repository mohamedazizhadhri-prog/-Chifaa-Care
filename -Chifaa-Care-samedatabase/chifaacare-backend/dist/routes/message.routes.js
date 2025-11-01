"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const message_controller_1 = require("../controllers/message.controller");
const router = express_1.default.Router();
router.get('/conversations/:userId', message_controller_1.getConversations);
router.get('/thread', message_controller_1.getThread);
router.post('/send', message_controller_1.sendMessage);
router.patch('/mark-read', message_controller_1.markThreadRead);
exports.default = router;
