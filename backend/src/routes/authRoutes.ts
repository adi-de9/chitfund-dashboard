import { Router } from "express";
import { registerController, loginController, refreshTokenController, logoutController } from "../controllers/auth.controllers";

const router = Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.post("/logout", logoutController);
router.post("/refresh", refreshTokenController);

export default router;
