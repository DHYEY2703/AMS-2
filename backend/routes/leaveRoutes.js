import express from "express";
import protect from "../middleware/authMiddleware.js";
import { applyLeave, getLeaves, updateLeaveStatus } from "../controllers/leaveController.js";

const router = express.Router();

router.post("/", protect(["student"]), applyLeave);
router.get("/", protect(["student", "teacher", "admin"]), getLeaves);
router.put("/:id", protect(["teacher", "admin"]), updateLeaveStatus);

export default router;
