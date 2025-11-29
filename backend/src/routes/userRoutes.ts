import { Router } from "express";
import * as userController from "../controllers/user.controllers";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// GET /users - List all users (Admin, Staff)
router.get("/", authorize(['admin', 'staff']), userController.getUsers);

// GET /users/:id - View single user profile (All roles)
router.get("/:id", authorize(['admin', 'staff', 'member']), userController.getUser);

// POST /users - Create user (Admin only)
router.post("/", authorize(['admin']), userController.createUser);

// PATCH /users/:id - Update user (Admin only)
router.patch("/:id", authorize(['admin']), userController.updateUser);

// PATCH /users/:id/status - Activate / Deactivate user (Admin only)
router.patch("/:id/status", authorize(['admin']), userController.updateUserStatus);

export default router;
