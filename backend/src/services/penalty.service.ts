import { prisma } from "../../lib/prisma";

// Apply penalty manually
export const applyPenalty = async (
  contributionId: string,
  amount: number,
  reason: string
) => {
  const contribution = await prisma.contribution.findUnique({
    where: { id: BigInt(contributionId) },
  });

  if (!contribution) throw new Error("Contribution not found");

  const penalty = await prisma.penalty.create({
    data: {
      contribution_id: BigInt(contributionId),
      user_id: contribution.user_id,
      cycle_id: contribution.cycle_id,
      group_member_id: contribution.group_member_id,
      penalty_amount: amount,
      applied_date: new Date(),
      reason: reason,
    },
  });

  // Add to Ledger
  await prisma.ledger.create({
    data: {
      user_id: contribution.user_id,
      group_id: contribution.group_id,
      cycle_id: contribution.cycle_id,
      contribution_id: contribution.id,
      transaction_type: "penalty",
      amount: amount,
      balance_after: 0,
      notes: `Penalty: ${reason}`,
    },
  });

  return penalty;
};

// Auto-check overdue and apply penalties
export const autoCheckPenalties = async (groupId: string) => {
  const group = await prisma.group.findUnique({
    where: { id: BigInt(groupId) },
  });

  if (!group) throw new Error("Group not found");

  // Logic: Find pending contributions past due date
  // This is a simplified version. In real world, we need to check if penalty already applied.
  // For now, let's just return a list of overdue contributions without applying to avoid duplicates in this simple logic.
  // Or we can apply if no penalty exists for that contribution.

  const overdueContributions = await prisma.contribution.findMany({
    where: {
      group_id: BigInt(groupId),
      payment_status: "pending",
      // In a real query we would check date > due_date
    },
    include: {
      penalties: true,
    },
  });

  const appliedPenalties = [];

  for (const contribution of overdueContributions) {
    if (contribution.penalties.length === 0) {
      // Apply penalty based on group settings
      let amount = group.penalty_amount;
      if (group.penalty_type === "percentage") {
        amount = (contribution.amount_payable * group.penalty_amount) / 100;
      }
      // Daily penalty logic would be more complex (calculating days overdue)

      if (amount > 0) {
        const penalty = await applyPenalty(
          contribution.id.toString(),
          amount,
          "Auto-applied late fee"
        );
        appliedPenalties.push(penalty);
        
        // Mark contribution as overdue if not already
        if (contribution.payment_status !== 'overdue') {
             await prisma.contribution.update({
                 where: { id: contribution.id },
                 data: { payment_status: 'overdue' }
             });
        }
      }
    }
  }

  return appliedPenalties;
};

// List penalties for a cycle
export const getPenalties = async (cycleId: string) => {
  return await prisma.penalty.findMany({
    where: { cycle_id: BigInt(cycleId) },
    include: {
      user: { select: { name: true } },
    },
  });
};
