import { Router } from "express";
import * as settingsController from "../controllers/settings.controllers";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/:groupId", authorize(["admin"]), settingsController.getSettings);
router.patch("/:groupId", authorize(["admin"]), settingsController.updateSettings);

export default router;
