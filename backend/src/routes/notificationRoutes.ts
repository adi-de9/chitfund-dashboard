import { Router } from "express";
import * as notificationController from "../controllers/notification.controllers";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

router.post("/send", authorize(["admin"]), notificationController.sendNotification);
router.post("/payment-alert/:userId", authorize(["admin"]), notificationController.sendPaymentAlert);
router.get("/:userId", authorize(["admin", "staff", "member"]), notificationController.getNotifications);

export default router;
