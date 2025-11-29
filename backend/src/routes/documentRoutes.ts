import { Router } from "express";
import * as documentController from "../controllers/document.controllers";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

router.post("/upload", authorize(["admin", "staff", "member"]), documentController.uploadDocument);
router.get("/:userId", authorize(["admin", "staff", "member"]), documentController.getDocuments);
router.delete("/:id", authorize(["admin"]), documentController.deleteDocument);

export default router;
