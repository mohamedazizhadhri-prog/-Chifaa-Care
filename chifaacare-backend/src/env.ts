import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the backend root .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export {};
