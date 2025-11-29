import { prisma } from "../../lib/prisma";
import type { Prisma } from "../../generated/prisma/client";

// Create chit fund group
export const createGroup = async (data: Prisma.GroupCreateInput) => {
  return await prisma.group.create({
    data,
  });
};

// List all groups
export const getAllGroups = async () => {
  return await prisma.group.findMany({
    orderBy: { created_at: "desc" },
  });
};

// Get group details
export const getGroupById = async (id: string) => {
  const group = await prisma.group.findUnique({
    where: { id: BigInt(id) },
    include: {
      group_members: {
        include: {
          user: {
            select: { id: true, name: true, phone: true, email: true,created_at:true, status:true },
          },
        },
      },
      cycles: {
        orderBy: { cycle_number: "asc" },
      },
      auctions: {
        orderBy: { auction_date: "desc" },
        take: 1, // Last auction
      },
    },
  });

  if (!group) {
    throw new Error("Group not found");
  }

  return group;
};

// Update group data
export const updateGroup = async (id: string, data: Prisma.GroupUpdateInput) => {
  return await prisma.group.update({
    where: { id: BigInt(id) },
    data,
  });
};

// Close/Open group
export const updateGroupStatus = async (id: string, status: string) => {
  return await prisma.group.update({
    where: { id: BigInt(id) },
    data: { status },
  });
};
