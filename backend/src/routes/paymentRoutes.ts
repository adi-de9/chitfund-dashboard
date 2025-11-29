import { Router } from "express";
import * as contributionController from "../controllers/contribution.controllers";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

router.post("/", authorize(["admin", "staff"]), contributionController.addSubPayment);
router.get("/:contributionId", authorize(["admin", "staff", "member"]), contributionController.getSubPayments);

export default router;
