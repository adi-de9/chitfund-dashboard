import { prisma } from "../../lib/prisma";
import { AuctionStatus } from "../../generated/prisma/client";

// Create next cycle
export const createCycle = async (groupId: string) => {
  const group = await prisma.group.findUnique({
    where: { id: BigInt(groupId) },
  });

  if (!group) {
    throw new Error("Group not found");
  }

  // Find last cycle
  const lastCycle = await prisma.cycle.findFirst({
    where: { group_id: BigInt(groupId) },
    orderBy: { cycle_number: "desc" },
  });

  let nextCycleNumber = 1;
  let nextCycleDate = new Date(group.start_date);

  if (lastCycle) {
    nextCycleNumber = lastCycle.cycle_number + 1;
    // Calculate next month based on last cycle (assuming monthly)
    // For simplicity, let's just use current date or increment from start date
    // A better approach is to store cycle date properly. 
    // Schema has `cycle_month_year` as String.
    // Let's assume we just increment month from start date.
    nextCycleDate = new Date(group.start_date);
    nextCycleDate.setMonth(nextCycleDate.getMonth() + (nextCycleNumber - 1));
  }

  const cycleMonthYear = `${nextCycleDate.toLocaleString('default', { month: 'long' })} ${nextCycleDate.getFullYear()}`;
  const totalCollectionExpected = group.monthly_contribution * group.total_members;

  return await prisma.cycle.create({
    data: {
      group_id: BigInt(groupId),
      cycle_number: nextCycleNumber,
      cycle_month_year: cycleMonthYear,
      auction_status: AuctionStatus.pending,
      total_collection_expected: totalCollectionExpected,
    },
  });
};

// List cycles for a group
export const getCyclesByGroupId = async (groupId: string) => {
  return await prisma.cycle.findMany({
    where: { group_id: BigInt(groupId) },
    orderBy: { cycle_number: "asc" },
  });
};

// Get cycle details
export const getCycleById = async (cycleId: string) => {
  const cycle = await prisma.cycle.findUnique({
    where: { id: BigInt(cycleId) },
    include: {
      auction: true,
      _count: {
        select: { contributions: true, penalties: true },
      },
    },
  });

  if (!cycle) {
    throw new Error("Cycle not found");
  }

  return cycle;
};
