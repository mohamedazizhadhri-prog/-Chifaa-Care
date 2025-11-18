import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';

// Load env in runtime (same as index.ts behavior)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

if (!process.env.CLOUDINARY_URL) {
  console.warn('[Cloudinary] Missing CLOUDINARY_URL in .env. Uploads will fail until configured.');
}

// Cloudinary SDK auto-configures from CLOUDINARY_URL if present
// Example: CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
cloudinary.config({
  secure: true,
});

export default cloudinary;
