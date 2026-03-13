import express from 'express';
import protect from "../middleware/authMiddleware.js";
import { getTeachers, getStudents, getParents, loginController, verifyOTP, authCheck, getUsers, updateProfile, createUser, forgotPassword, verifyResetOTP, resetPassword } from "../controllers/userController.js";

const router = express.Router();

// Admin creates user
router.post("/create", protect(["admin"]), createUser);

// Login - Step 1: Credentials
router.post("/login", loginController);

// Login - Step 2: OTP Verification
router.post("/verify-otp", verifyOTP);

// Forgot Password Flow
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOTP);
router.post("/reset-password", resetPassword);

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

// Get all parents
router.get("/parents", protect(["admin", "teacher"]), getParents);

export default router;
