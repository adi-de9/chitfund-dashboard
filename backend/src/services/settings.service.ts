import { prisma } from "../../lib/prisma";

// Get group settings
export const getSettings = async (groupId: string) => {
  const group = await prisma.group.findUnique({
    where: { id: BigInt(groupId) },
    select: {
      due_date: true,
      penalty_type: true,
      penalty_amount: true,
    },
  });

  if (!group) throw new Error("Group not found");

  return group;
};

// Update group settings
export const updateSettings = async (
  groupId: string,
  data: {
    dueDate?: number;
    penaltyType?: string;
    penaltyValue?: number;
  }
) => {
  return await prisma.group.update({
    where: { id: BigInt(groupId) },
    data: {
      due_date: data.dueDate,
      penalty_type: data.penaltyType,
      penalty_amount: data.penaltyValue,
    },
    select: {
      due_date: true,
      penalty_type: true,
      penalty_amount: true,
    },
  });
};
