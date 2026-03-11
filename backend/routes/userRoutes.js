import express from 'express';
import protect from "../middleware/authMiddleware.js";
import { getTeachers, getStudents, loginController, signupController, authCheck, getUsers, updateProfile } from "../controllers/userController.js";

const router = express.Router();
// Signup
router.post("/signup", signupController);

// Login
router.post("/login", loginController);

// Logout
router.post("/logout", protect(), async (req, res) => {
  res.json({ msg: "Logged out successfully" });
});

// Auth check endpoint
router.get("/auth/check", protect(), authCheck);

// Update profile
router.put("/profile", protect(), updateProfile);

// Get all users (Admin only)
router.get("/", protect(["admin"]), getUsers);

// Get all teachers
router.get("/teachers", protect(), getTeachers);

// Get all students
router.get("/students", protect(), getStudents);

export default router;
