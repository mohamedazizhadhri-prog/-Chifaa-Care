"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary_1 = require("cloudinary");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load env in runtime (same as index.ts behavior)
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
if (!process.env.CLOUDINARY_URL) {
    console.warn('[Cloudinary] Missing CLOUDINARY_URL in .env. Uploads will fail until configured.');
}
// Cloudinary SDK auto-configures from CLOUDINARY_URL if present
// Example: CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
cloudinary_1.v2.config({
    secure: true,
});
exports.default = cloudinary_1.v2;
