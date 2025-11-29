import { prisma } from "../../lib/prisma";

// Run auction
export const runAuction = async (
  cycleId: string,
  bids: { userId: string; amount: number }[]
) => {
  const cycle = await prisma.cycle.findUnique({
    where: { id: BigInt(cycleId) },
    include: { group: true },
  });

  if (!cycle) throw new Error("Cycle not found");

  // Find highest bid
  let winningBid = { userId: "", amount: 0 };
  for (const bid of bids) {
    if (bid.amount > winningBid.amount) {
      winningBid = bid;
    }
  }

  if (!winningBid.userId) throw new Error("No valid bids");

  const chitValue = cycle.group.chit_value;
  const winnerPayout = chitValue - winningBid.amount;
  const dividendPerMember = winningBid.amount / cycle.group.total_members;

  // Create or update Auction record
  // Assuming one auction per cycle, so we use upsert or findUnique
  // Schema says cycle_id is unique in Auction

  const auction = await prisma.auction.upsert({
    where: { cycle_id: BigInt(cycleId) },
    update: {
      winning_bid_amount: winningBid.amount,
      winner_user_id: BigInt(winningBid.userId),
      winner_payout_amount: winnerPayout,
      dividend_per_member: dividendPerMember,
      status: "complete",
      auction_type: "online", // Default
    },
    create: {
      group_id: cycle.group_id,
      cycle_id: BigInt(cycleId),
      auction_date: new Date(),
      auction_type: "online",
      winning_bid_amount: winningBid.amount,
      winner_user_id: BigInt(winningBid.userId),
      winner_payout_amount: winnerPayout,
      dividend_per_member: dividendPerMember,
      status: "complete",
    },
  });

  // Save all bids
  await prisma.bid.createMany({
    data: bids.map((bid) => ({
      auction_id: auction.id,
      user_id: BigInt(bid.userId),
      bid_amount: bid.amount,
    })),
  });

  // Update cycle status
  await prisma.cycle.update({
    where: { id: BigInt(cycleId) },
    data: { auction_status: "complete" },
  });

  // Update winner's won_status in GroupMember
  await prisma.groupMember.updateMany({
    where: {
      group_id: cycle.group_id,
      user_id: BigInt(winningBid.userId),
    },
    data: { won_status: true },
  });

  return auction;
};

// Get auction result
export const getAuction = async (cycleId: string) => {
  return await prisma.auction.findUnique({
    where: { cycle_id: BigInt(cycleId) },
    include: {
      winner: { select: { name: true } },
      bids: {
        include: {
          user: { select: { name: true } },
        },
        orderBy: { bid_amount: "desc" },
      },
    },
  });
};

// Place a single bid (if live bidding)
export const placeBid = async (
  auctionId: string,
  userId: string,
  amount: number
) => {
  return await prisma.bid.create({
    data: {
      auction_id: BigInt(auctionId),
      user_id: BigInt(userId),
      bid_amount: amount,
    },
  });
};

// View all bids for an auction
export const getBids = async (auctionId: string) => {
  return await prisma.bid.findMany({
    where: { auction_id: BigInt(auctionId) },
    include: {
      user: { select: { name: true } },
    },
    orderBy: { bid_amount: "desc" },
  });
};
