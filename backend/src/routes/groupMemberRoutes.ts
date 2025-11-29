import { Router } from "express";
import {
  addMember,
  getMembers,
  updateMember,
  updateWonStatus,
} from "../controllers/groupMember.controllers";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

// Add member (Admin only)
router.post("/", authorize(["admin"]), addMember);

// List members (Admin, Staff, Member)
router.get("/:groupId", authorize(["admin", "staff", "member"]), getMembers);

// Update nominee info (Admin only)
router.patch("/:id", authorize(["admin"]), updateMember);

// Update won status (Admin only)
router.patch("/:id/won-status", authorize(["admin"]), updateWonStatus);

export default router;
