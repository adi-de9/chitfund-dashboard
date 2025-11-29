import { Router } from "express";
import * as penaltyController from "../controllers/penalty.controllers";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

router.post("/apply/:contributionId", authorize(["admin"]), penaltyController.applyPenalty);
router.post("/auto-check/:groupId", authorize(["admin"]), penaltyController.autoCheckPenalties);
router.get("/:cycleId", authorize(["admin", "staff", "member"]), penaltyController.getPenalties);

export default router;
