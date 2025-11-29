import { Router } from "express";
import {
  createCycle,
  getCycles,
  getCycle,
} from "../controllers/cycle.controllers";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

// Create next monthly cycle (Admin only)
router.post("/create/:groupId", authorize(["admin"]), createCycle);

// List cycles of a group (Admin, Staff, Member)
router.get("/:groupId", authorize(["admin", "staff", "member"]), getCycles);

// Cycle summary (Admin, Staff, Member)
router.get("/cycle/:cycleId", authorize(["admin", "staff", "member"]), getCycle);

export default router;
