import type { Request, Response } from "express";
import * as userService from "../services/user.service";

// Helper to handle BigInt serialization
const serialize = (data: any) => {
  return JSON.parse(JSON.stringify(data, (key, value) =>
    typeof value === 'bigint'
      ? value.toString()
      : value
  ));
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();
    res.json(serialize(users));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) throw new Error("User ID is required");
    const user = await userService.getUserById(id);
    res.json(serialize(user));
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, phone, password, name, role } = req.body;
    const user = await userService.createUser({
      email,
      phone,
      name,
      password_hash: password, // Service hashes it
      role
    });
    res.status(201).json(serialize(user));
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) throw new Error("User ID is required");
    const data = req.body;
    
    // If password is provided, map it to password_hash
    if (data.password) {
      data.password_hash = data.password;
      delete data.password;
    }

    const user = await userService.updateUser(id, data);
    res.json(serialize(user));
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) throw new Error("User ID is required");
    const { status } = req.body; // Expecting { status: 'active' | 'inactive' }
    
    if (status !== 'active' && status !== 'inactive') {
        res.status(400).json({ error: "Invalid status. Must be 'active' or 'inactive'." });
        return;
    }

    const user = await userService.updateUserStatus(id, status);
    res.json(serialize(user));
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
