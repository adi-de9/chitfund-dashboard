import { Router } from "express";
import {
  createGroup,
  getGroups,
  getGroup,
  updateGroup,
  updateGroupStatus,
} from "../controllers/group.controllers";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create group (Admin only)
router.post("/", authorize(["admin"]), createGroup);

// List groups (Admin only for now, maybe staff later)
router.get("/", authorize(["admin"]), getGroups);

// Get group details (Admin, Staff, Member)
// Note: Member might need restriction to only their own groups later
router.get("/:id", authorize(["admin", "staff", "member"]), getGroup);

// Update group (Admin only)
router.patch("/:id", authorize(["admin"]), updateGroup);

// Update group status (Admin only)
router.patch("/:id/status", authorize(["admin"]), updateGroupStatus);

export default router;
