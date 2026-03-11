import Subject from '../models/SubjectModel.js';
import User from '../models/UserModel.js';

export const getSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find().populate('classId', 'name').populate('teacherId', 'name');
        res.json(subjects);
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getSubjectsByClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const filter = { classId };

        // If the user is a teacher, they can only see subjects assigned to them
        if (req.user && req.user.role === 'teacher') {
            filter.teacherId = req.user.id;
        }

        const subjects = await Subject.find(filter).populate('teacherId', 'name');
        res.json(subjects);
    } catch (error) {
        console.error('Error fetching subjects for class:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const addSubject = async (req, res) => {
    try {
        const { name, classId, teacherId } = req.body;

        const existing = await Subject.findOne({ name: name.trim(), classId });
        if (existing) {
            return res.status(400).json({ message: "Subject already exists in this class" });
        }

        const newSubject = new Subject({
            name: name.trim(),
            classId,
            teacherId: teacherId || null
        });

        await newSubject.save();
        res.status(201).json(newSubject);
    } catch (error) {
        console.error('Error adding subject:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateSubject = async (req, res) => {
    try {
        const { subjectId } = req.params;
        const { name, teacherId } = req.body;
        const updatedSubject = await Subject.findByIdAndUpdate(
            subjectId,
            { name, teacherId: teacherId || null },
            { new: true }
        );
        if (!updatedSubject) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        res.json(updatedSubject);
    } catch (error) {
        console.error('Error updating subject:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteSubject = async (req, res) => {
    try {
        const { subjectId } = req.params;
        const deletedSubject = await Subject.findByIdAndDelete(subjectId);
        if (!deletedSubject) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        res.json({ message: 'Subject deleted successfully' });
    } catch (error) {
        console.error('Error deleting subject:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
