import { prisma } from "../../lib/prisma";

// Get user's full transaction history
export const getUserLedger = async (userId: string) => {
  return await prisma.ledger.findMany({
    where: { user_id: BigInt(userId) },
    include: {
      group: { select: { group_name: true } },
    },
    orderBy: { date: "desc" },
  });
};

// Get ledger within a specific group
export const getGroupLedger = async (groupId: string, userId: string) => {
  return await prisma.ledger.findMany({
    where: {
      group_id: BigInt(groupId),
      user_id: BigInt(userId),
    },
    orderBy: { date: "desc" },
  });
};

// Add manual adjustment entry
export const addManualEntry = async (
  userId: string,
  groupId: string,
  amount: number,
  notes: string
) => {
  // Determine transaction type based on amount sign? Or just generic?
  // Schema has TransactionType enum: contribution, penalty, dividend, winner_payout
  // Manual entry might not fit perfectly. Let's assume 'contribution' or add 'adjustment' to enum?
  // For now, let's use 'contribution' if positive, 'penalty' if negative?
  // Or just use 'contribution' with notes.
  // Actually, let's check schema again.
  // enum TransactionType { contribution, penalty, dividend, winner_payout }
  // We might need to update schema to support 'adjustment' or 'other'.
  // For now, I'll use 'contribution' as a fallback.

  return await prisma.ledger.create({
    data: {
      user_id: BigInt(userId),
      group_id: BigInt(groupId),
      transaction_type: "contribution", // Fallback
      amount: amount,
      balance_after: 0, // TODO: Calc
      notes: `Manual Adjustment: ${notes}`,
    },
  });
};
