import { Router } from "express";
import * as auctionController from "../controllers/auction.controllers";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

router.post("/", authorize(["admin", "member"]), auctionController.placeBid);
router.get("/:auctionId", authorize(["admin", "staff", "member"]), auctionController.getBids);

export default router;
