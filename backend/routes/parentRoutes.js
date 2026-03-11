import express from "express";
import protect from "../middleware/authMiddleware.js";
import { getMyChildren, getChildAttendance } from "../controllers/parentController.js";

const router = express.Router();

// Only Parents can access their dashboard routes
router.get("/children", protect(["parent"]), getMyChildren);
router.get("/children/:childId/attendance", protect(["parent"]), getChildAttendance);

export default router;
