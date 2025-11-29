import { Router } from "express";
import * as auctionController from "../controllers/auction.controllers";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

router.post("/run/:cycleId", authorize(["admin"]), auctionController.runAuction);
router.get("/:cycleId", authorize(["admin", "staff", "member"]), auctionController.getAuction);

export default router;
