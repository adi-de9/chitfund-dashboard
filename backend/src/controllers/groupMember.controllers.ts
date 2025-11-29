import type { Request, Response } from "express";
import * as groupMemberService from "../services/groupMember.service";
import { z } from "zod";

// Helper to handle BigInt serialization
const serialize = (data: any) => {
  return JSON.parse(JSON.stringify(data, (key, value) =>
    typeof value === 'bigint'
      ? value.toString()
      : value
  ));
};

import * as userService from "../services/user.service";

const addMemberSchema = z.object({
  groupId: z.string(),
  userId: z.string().optional(),
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  nomineeName: z.string().optional(),
  nomineePhone: z.string().optional(),
});

export const addMember = async (req: Request, res: Response) => {
  try {
    const validatedData = addMemberSchema.parse(req.body);
    let userId = validatedData.userId;

    // If userId is not provided, try to find or create user
    if (!userId) {
      if (!validatedData.phone || !validatedData.name) {
        return res.status(400).json({ error: "Name and Phone are required if User ID is not provided" });
      }

      const existingUser = await userService.getUserByPhone(validatedData.phone);
      
      if (existingUser) {
        userId = existingUser.id.toString();
      } else {
        // Create new user
        const newUser = await userService.createUser({
          name: validatedData.name,
          phone: validatedData.phone,
          email: validatedData.email,
          password_hash: validatedData.phone, // Default password is phone number
          role: "member",
        });
        userId = newUser.id.toString();
      }
    }

    const member = await groupMemberService.addMemberToGroup({
      group_id: validatedData.groupId,
      user_id: userId!,
      nominee_name: validatedData.nomineeName,
      nominee_phone: validatedData.nomineePhone,
    });
    res.status(201).json(serialize(member));
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};

export const getMembers = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    if (!groupId) throw new Error("Group ID is required");
    const members = await groupMemberService.getGroupMembers(groupId);
    res.json(serialize(members));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateMember = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) throw new Error("Member ID is required");
    const member = await groupMemberService.updateMember(id, req.body);
    res.json(serialize(member));
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateWonStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) throw new Error("Member ID is required");
    const { wonStatus } = req.body;
    
    if (typeof wonStatus !== 'boolean') {
        res.status(400).json({ error: "wonStatus must be a boolean" });
        return;
    }

    const member = await groupMemberService.updateWonStatus(id, wonStatus);
    res.json(serialize(member));
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
