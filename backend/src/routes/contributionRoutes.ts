import { Router } from "express";
import * as contributionController from "../controllers/contribution.controllers";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

router.post("/init/:cycleId", authorize(["admin"]), contributionController.initContributions);
router.get("/:cycleId", authorize(["admin", "staff", "member"]), contributionController.getContributions);
router.post("/pay/:contributionId", authorize(["admin", "staff"]), contributionController.recordPayment);
router.patch("/:id/status", authorize(["admin"]), contributionController.updateStatus);

// Sub-payments (using /payments prefix in app.ts or here? Plan said POST /payments)
// I will mount this router at /contributions and handle /payments separately or mix them.
// The plan had /payments as separate. I'll create a separate router or just add here if mounted at root?
// Usually app.ts mounts routes. I'll put these in contributionRoutes but they might need different prefix if app.ts mounts at /contributions.
// Let's assume app.ts mounts this at /contributions.
// But the request asked for POST /payments.
// I will create a separate paymentRoutes.ts or handle it in app.ts.
// For simplicity, I'll put them here but the path will be relative to mount point.
// If I mount this at /api, then I can define /contributions/... and /payments/...
// But usually we mount by resource.
// I'll stick to the plan: separate files if needed, or just one file exporting multiple routers?
// No, standard is one router per file.
// I'll add the payment routes here but with specific paths if I mount at /api.
// Wait, app.ts usually mounts `contributionRoutes` at `/contributions`.
// So `POST /payments` would be `/contributions/payments`? That's not what user asked.
// User asked `POST /payments`.
// I will create `paymentRoutes.ts` for that.

export default router;
