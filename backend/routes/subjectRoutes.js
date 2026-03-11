import express from 'express';
import { addSubject, getSubjects, updateSubject, deleteSubject, getSubjectsByClass } from '../controllers/subjectController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect(), getSubjects);
router.post('/', protect(["admin"]), addSubject);
router.get('/class/:classId', protect(), getSubjectsByClass);
router.put('/:subjectId', protect(["admin"]), updateSubject);
router.delete('/:subjectId', protect(["admin"]), deleteSubject);

export default router;
