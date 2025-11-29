import { prisma } from "../../lib/prisma";
import type { Prisma } from "../../generated/prisma/client";

// Add member to group
export const addMemberToGroup = async (data: {
  group_id: string;
  user_id: string;
  nominee_name?: string;
  nominee_phone?: string;
}) => {
  // Check if user is already in the group
  const existingMember = await prisma.groupMember.findFirst({
    where: {
      group_id: BigInt(data.group_id),
      user_id: BigInt(data.user_id),
    },
  });

  if (existingMember) {
    throw new Error("User is already a member of this group");
  }

  return await prisma.groupMember.create({
    data: {
      group_id: BigInt(data.group_id),
      user_id: BigInt(data.user_id),
      nominee_name: data.nominee_name,
      nominee_phone: data.nominee_phone,
      join_date: new Date(),
    },
  });
};

// List all group members
export const getGroupMembers = async (groupId: string) => {
  return await prisma.groupMember.findMany({
    where: { group_id: BigInt(groupId) },
    include: {
      user: {
        select: { id: true, name: true, phone: true, email: true,created_at:true, status:true },
      },
    },
  });
};

// Update nominee info
export const updateMember = async (id: string, data: Prisma.GroupMemberUpdateInput) => {
  return await prisma.groupMember.update({
    where: { id: BigInt(id) },
    data,
  });
};

// Update winning status
export const updateWonStatus = async (id: string, wonStatus: boolean) => {
  return await prisma.groupMember.update({
    where: { id: BigInt(id) },
    data: { won_status: wonStatus },
  });
};
