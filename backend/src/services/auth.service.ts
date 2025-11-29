import type { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import jwt from "jsonwebtoken";
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from "../constants";

export const registerUser = async (data: Prisma.UserCreateInput) => {
  const { email, phone, password_hash, name, role } = data;

  // Check if user exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { phone }],
    },
  });

  if (existingUser) {
    throw new Error("User with this email or phone already exists");
  }

  // Hash password using Bun's built-in hasher
  const hashedPassword = await Bun.password.hash(password_hash);

  const user = await prisma.user.create({
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
          phone: true,
          email: true,
        //   role: true,
        //   status: true,
          created_at: true,
      }
  });

  return user;
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isPasswordValid = await Bun.password.verify(
    password,
    user.password_hash
  );

  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  const accessToken = jwt.sign(
    { userId: user.id.toString(), role: user.role },
    JWT_ACCESS_SECRET,
    { expiresIn: "1d" }
  );

  const refreshToken = jwt.sign(
    { userId: user.id.toString(), role: user.role },
    JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  return { user, accessToken, refreshToken };
};

export const refreshAccessToken = async (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string; role: any };
    
    const accessToken = jwt.sign(
      { userId: decoded.userId, role: decoded.role },
      JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    return { accessToken };
  } catch (error) {
    throw new Error("Invalid refresh token");
  }
};
