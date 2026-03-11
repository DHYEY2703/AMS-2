import express from "express";
import protect from "../middleware/authMiddleware.js";
import { getTimetable } from "../controllers/timetableController.js";

const router = express.Router();

router.get("/", protect(["student", "teacher"]), getTimetable);

export default router;
