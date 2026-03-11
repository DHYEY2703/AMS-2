import express from "express";
import protect from "../middleware/authMiddleware.js";
import { getAuditLogs } from "../controllers/auditLogController.js";

const router = express.Router();

// Only Admins can view audit logs
router.get("/", protect(["admin"]), getAuditLogs);

export default router;
