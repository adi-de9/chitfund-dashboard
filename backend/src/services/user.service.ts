import { prisma } from "../../lib/prisma";
import type { Prisma } from "../../generated/prisma/client";

// List all users
export const getAllUsers = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      created_at: true,
    },
  });
};

// Get single user by ID
export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id: BigInt(id) },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      created_at: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// Get user by Phone
export const getUserByPhone = async (phone: string) => {
  return await prisma.user.findUnique({
    where: { phone },
  });
};

// Create user (Admin adds staff/member)
export const createUser = async (data: Prisma.UserCreateInput) => {
  const { email, phone, password_hash, name, role } = data;

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { phone }],
    },
  });

  if (existingUser) {
    throw new Error("User with this email or phone already exists");
  }

  const hashedPassword = await Bun.password.hash(password_hash);

  return await prisma.user.create({
    data: {
      email,
      phone,
      name,
      password_hash: hashedPassword,
      role: role || "member",
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      created_at: true,
    },
  });
};

// Update user details
export const updateUser = async (id: string, data: Prisma.UserUpdateInput) => {
  // If password is being updated, hash it
  if (typeof data.password_hash === 'string') {
    data.password_hash = await Bun.password.hash(data.password_hash);
  }

  return await prisma.user.update({
    where: { id: BigInt(id) },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      created_at: true,
    },
  });
};

// Activate / Deactivate user
export const updateUserStatus = async (id: string, status: 'active' | 'inactive') => {
  return await prisma.user.update({
    where: { id: BigInt(id) },
    data: { status },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      created_at: true,
    },
  });
};
