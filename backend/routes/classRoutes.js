import express from 'express';
import { getClasses, getStudentsByClass, addClass, updateClass, deleteClass } from '../controllers/classController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect(), getClasses);
router.get('/:classId/students', getStudentsByClass);
router.post('/', protect(), addClass);
router.put('/:classId', protect(), updateClass);
router.delete('/:classId', protect(), deleteClass);

export default router;
