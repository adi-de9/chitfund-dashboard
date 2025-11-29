import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import groupRoutes from "./routes/groupRoutes";
import groupMemberRoutes from "./routes/groupMemberRoutes";
import cycleRoutes from "./routes/cycleRoutes";
import contributionRoutes from "./routes/contributionRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import penaltyRoutes from "./routes/penaltyRoutes";
import settingsRoutes from "./routes/settingsRoutes";
import auctionRoutes from "./routes/auctionRoutes";
import bidRoutes from "./routes/bidRoutes";
import ledgerRoutes from "./routes/ledgerRoutes";
import documentRoutes from "./routes/documentRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import { logDetails } from "./middlewares/logger.middleware";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", // Consider replacing "*" with specific origins in production for security
    credentials: true, // Cannot be true when origin is "*"
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(logDetails);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/group-members", groupMemberRoutes);
app.use("/api/cycles", cycleRoutes);
app.use("/api/contributions", contributionRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/penalties", penaltyRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/auction", auctionRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/ledger", ledgerRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/notifications", notificationRoutes);

export {app}
