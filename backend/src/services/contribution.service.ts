import { prisma } from "../../lib/prisma";
import type { Prisma } from "../../generated/prisma/client";

// Initialize contributions for a cycle
export const initContributions = async (cycleId: string) => {
  const cycle = await prisma.cycle.findUnique({
    where: { id: BigInt(cycleId) },
    include: { group: true },
  });

  if (!cycle) throw new Error("Cycle not found");

  const members = await prisma.groupMember.findMany({
    where: { group_id: cycle.group_id },
  });

  const contributions = await Promise.all(
    members.map((member) =>
      prisma.contribution.create({
        data: {
          group_id: cycle.group_id,
          user_id: member.user_id,
          cycle_id: BigInt(cycleId),
          group_member_id: member.id,
          amount_payable: cycle.group.monthly_contribution,
          payment_status: "pending",
        },
      })
    )
  );

  return contributions;
};

// List contributions for a cycle
export const getContributions = async (cycleId: string) => {
  return await prisma.contribution.findMany({
    where: { cycle_id: BigInt(cycleId) },
    include: {
      user: { select: { id: true, name: true } },
      group_member: { select: { id: true } },
    },
  });
};

// Record payment (supports partial)
export const recordPayment = async (
  contributionId: string,
  amount: number,
  paymentMode: "upi" | "cash" | "bank",
  referenceNo?: string
) => {
  const contribution = await prisma.contribution.findUnique({
    where: { id: BigInt(contributionId) },
  });

  if (!contribution) throw new Error("Contribution not found");

  const newAmountPaid = contribution.amount_paid + amount;
  const status =
    newAmountPaid >= contribution.amount_payable ? "paid" : "pending";
  const isPartial = newAmountPaid < contribution.amount_payable;

  const updatedContribution = await prisma.contribution.update({
    where: { id: BigInt(contributionId) },
    data: {
      amount_paid: newAmountPaid,
      payment_status: status,
      payment_mode: paymentMode,
      payment_date: new Date(),
      reference_no: referenceNo,
      is_partial: isPartial,
    },
  });

  // Add to Ledger
  await prisma.ledger.create({
    data: {
      user_id: contribution.user_id,
      group_id: contribution.group_id,
      cycle_id: contribution.cycle_id,
      contribution_id: contribution.id,
      transaction_type: "contribution",
      amount: amount,
      balance_after: 0, // TODO: Calculate actual balance
      notes: `Payment for cycle ${contribution.cycle_id}`,
    },
  });

  return updatedContribution;
};

// Manual status update
export const updateContributionStatus = async (
  id: string,
  status: "paid" | "pending" | "overdue"
) => {
  return await prisma.contribution.update({
    where: { id: BigInt(id) },
    data: { payment_status: status },
  });
};

// Add sub-payment (when someone else pays for a member)
// Note: Schema doesn't have a separate SubPayment model, so we'll log it in Ledger or just update Contribution.
// For now, assuming it updates the main contribution and logs in ledger.
// If a SubPayment table is needed, we should add it. Based on request "GET /payments/:contributionId", it implies a list.
// Since we don't have a SubPayment model, I'll skip creating a separate table for now and assume it's just updating the contribution.
// However, to support "GET /payments/:contributionId", we might need a relation.
// Let's stick to updating contribution and adding a ledger entry for now.
// If the user really wants to track WHO paid, we might need a `payer_name` in Ledger or a new table.
// The request says "Body: contributionId, userId, payerName, amount".
// I will create a simple implementation that updates the contribution and adds a note to the ledger.

export const addSubPayment = async (
  contributionId: string,
  userId: string, // The actual member
  payerName: string,
  amount: number
) => {
  // Same logic as recordPayment but with payerName note
  const contribution = await prisma.contribution.findUnique({
    where: { id: BigInt(contributionId) },
  });

  if (!contribution) throw new Error("Contribution not found");

  const newAmountPaid = contribution.amount_paid + amount;
  const status =
    newAmountPaid >= contribution.amount_payable ? "paid" : "pending";
  const isPartial = newAmountPaid < contribution.amount_payable;

  const updatedContribution = await prisma.contribution.update({
    where: { id: BigInt(contributionId) },
    data: {
      amount_paid: newAmountPaid,
      payment_status: status,
      payment_date: new Date(),
      is_partial: isPartial,
    },
  });

  // Add to Ledger with payer info
  await prisma.ledger.create({
    data: {
      user_id: BigInt(userId),
      group_id: contribution.group_id,
      cycle_id: contribution.cycle_id,
      contribution_id: contribution.id,
      transaction_type: "contribution",
      amount: amount,
      balance_after: 0,
      notes: `Sub-payment by ${payerName}`,
    },
  });

  return updatedContribution;
};

// Get sub-payments (from Ledger for now)
export const getSubPayments = async (contributionId: string) => {
  return await prisma.ledger.findMany({
    where: {
      contribution_id: BigInt(contributionId),
      transaction_type: "contribution",
    },
  });
};
