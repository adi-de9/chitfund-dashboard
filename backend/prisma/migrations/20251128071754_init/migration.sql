-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'member', 'staff');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "AuctionStatus" AS ENUM ('pending', 'complete');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('paid', 'pending', 'overdue');

-- CreateEnum
CREATE TYPE "PaymentMode" AS ENUM ('upi', 'cash', 'bank');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('contribution', 'penalty', 'dividend', 'winner_payout');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('aadhaar', 'pan', 'photo');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('sms', 'whatsapp', 'email');

-- CreateTable
CREATE TABLE "User" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'member',
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" BIGSERIAL NOT NULL,
    "group_name" TEXT NOT NULL,
    "group_code" TEXT NOT NULL,
    "chit_value" DOUBLE PRECISION NOT NULL,
    "total_members" INTEGER NOT NULL,
    "monthly_contribution" DOUBLE PRECISION NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupMember" (
    "id" BIGSERIAL NOT NULL,
    "group_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "join_date" TIMESTAMP(3) NOT NULL,
    "nominee_name" TEXT,
    "nominee_phone" TEXT,
    "won_status" BOOLEAN NOT NULL DEFAULT false,
    "order_of_winning" INTEGER,

    CONSTRAINT "GroupMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cycle" (
    "id" BIGSERIAL NOT NULL,
    "group_id" BIGINT NOT NULL,
    "cycle_number" INTEGER NOT NULL,
    "cycle_month_year" TEXT NOT NULL,
    "auction_status" "AuctionStatus" NOT NULL,
    "total_collection_expected" DOUBLE PRECISION NOT NULL,
    "total_collection_received" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "Cycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contribution" (
    "id" BIGSERIAL NOT NULL,
    "group_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "cycle_id" BIGINT NOT NULL,
    "group_member_id" BIGINT NOT NULL,
    "amount_payable" DOUBLE PRECISION NOT NULL,
    "amount_paid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "payment_mode" "PaymentMode",
    "payment_status" "PaymentStatus" NOT NULL,
    "payment_date" TIMESTAMP(3),
    "reference_no" TEXT,
    "is_partial" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Contribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Penalty" (
    "id" BIGSERIAL NOT NULL,
    "contribution_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "cycle_id" BIGINT NOT NULL,
    "group_member_id" BIGINT NOT NULL,
    "penalty_amount" DOUBLE PRECISION NOT NULL,
    "applied_date" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,

    CONSTRAINT "Penalty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Auction" (
    "id" BIGSERIAL NOT NULL,
    "group_id" BIGINT NOT NULL,
    "cycle_id" BIGINT NOT NULL,
    "auction_date" TIMESTAMP(3) NOT NULL,
    "auction_type" TEXT NOT NULL,
    "winner_user_id" BIGINT,
    "winning_bid_amount" DOUBLE PRECISION,
    "winner_payout_amount" DOUBLE PRECISION,
    "dividend_per_member" DOUBLE PRECISION,
    "status" "AuctionStatus" NOT NULL,

    CONSTRAINT "Auction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bid" (
    "id" BIGSERIAL NOT NULL,
    "auction_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "bid_amount" DOUBLE PRECISION NOT NULL,
    "bid_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ledger" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "group_id" BIGINT NOT NULL,
    "cycle_id" BIGINT,
    "contribution_id" BIGINT,
    "transaction_type" "TransactionType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "balance_after" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "Ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "doc_type" "DocumentType" NOT NULL,
    "file_url" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "message_type" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "status" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Group_group_code_key" ON "Group"("group_code");

-- CreateIndex
CREATE UNIQUE INDEX "Auction_cycle_id_key" ON "Auction"("cycle_id");

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cycle" ADD CONSTRAINT "Cycle_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "Cycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_group_member_id_fkey" FOREIGN KEY ("group_member_id") REFERENCES "GroupMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Penalty" ADD CONSTRAINT "Penalty_contribution_id_fkey" FOREIGN KEY ("contribution_id") REFERENCES "Contribution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Penalty" ADD CONSTRAINT "Penalty_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Penalty" ADD CONSTRAINT "Penalty_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "Cycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Penalty" ADD CONSTRAINT "Penalty_group_member_id_fkey" FOREIGN KEY ("group_member_id") REFERENCES "GroupMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auction" ADD CONSTRAINT "Auction_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auction" ADD CONSTRAINT "Auction_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "Cycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auction" ADD CONSTRAINT "Auction_winner_user_id_fkey" FOREIGN KEY ("winner_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "Auction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ledger" ADD CONSTRAINT "Ledger_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ledger" ADD CONSTRAINT "Ledger_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ledger" ADD CONSTRAINT "Ledger_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "Cycle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ledger" ADD CONSTRAINT "Ledger_contribution_id_fkey" FOREIGN KEY ("contribution_id") REFERENCES "Contribution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
