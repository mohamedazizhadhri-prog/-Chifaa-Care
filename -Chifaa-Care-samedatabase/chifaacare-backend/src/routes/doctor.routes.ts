import express from 'express';
import { getAllDoctors } from '../controllers/doctor.controller';
import { protect } from '../controllers/auth.controller';

const router = express.Router();

// This route could be protected if only logged-in users can see doctors
// For a public search, protect can be removed.
router.route('/').get(getAllDoctors);

export default router;
