import { Router } from "express";
import * as ledgerController from "../controllers/ledger.controllers";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/:userId", authorize(["admin", "staff", "member"]), ledgerController.getUserLedger);
router.get("/:groupId/:userId", authorize(["admin", "staff", "member"]), ledgerController.getGroupLedger);
router.post("/add", authorize(["admin"]), ledgerController.addManualEntry);

export default router;
