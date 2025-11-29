import type { Request, Response } from "express";
import { registerUser, loginUser, refreshAccessToken } from "../services/auth.service";

export const registerController = async (req: Request, res: Response) => {
  try {
    const { email, phone, password, name, role } = req.body;
    
    // Pass password as password_hash to match Prisma input type, 
    // though service will hash it.
    const user = await registerUser({ 
      email, 
      phone, 
      name, 
      password_hash: password, // Service will hash this
      role 
    });

    // Return user without password_hash (BigInt handling needed for JSON)
    const { password_hash: _, ...userWithoutPassword } = user as any;
    
    // Handle BigInt serialization
    const serializedUser = JSON.parse(JSON.stringify(userWithoutPassword, (key, value) =>
        typeof value === 'bigint'
            ? value.toString()
            : value // return everything else unchanged
    ));

    res.status(201).json(serializedUser);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const loginController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await loginUser(email, password);

    const { password_hash: _, ...userWithoutPassword } = user as any;
    
    // Handle BigInt serialization
    const serializedUser = JSON.parse(JSON.stringify(userWithoutPassword, (key, value) =>
        typeof value === 'bigint'
            ? value.toString()
            : value // return everything else unchanged
    ));

    // Set cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      maxAge:   24 * 60 * 60 * 1000,
    }); // 15m
    res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7d

    res.json({ user: serializedUser, accessToken, refreshToken });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};

export const logoutController = async (req: Request, res: Response) => {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({ message: "Logout successful" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const refreshTokenController = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.body.refreshToken || req.cookies.refreshToken;
    
    if (!refreshToken) {
        res.status(400).json({ error: "Refresh token is required" });
        return;
    }
    const { accessToken } = await refreshAccessToken(refreshToken);
    
    // Update access token cookie
    res.cookie('accessToken', accessToken, { httpOnly: true, maxAge: 15 * 60 * 1000 }); // 15m

    res.json({ accessToken });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};