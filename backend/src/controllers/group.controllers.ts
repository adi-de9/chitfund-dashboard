import type { Request, Response } from "express";
import * as groupService from "../services/group.service";
import { z } from "zod";

// Helper to handle BigInt serialization
const serialize = (data: any) => {
  return JSON.parse(JSON.stringify(data, (key, value) =>
    typeof value === 'bigint'
      ? value.toString()
      : value
  ));
};

// Zod schema for creating a group
const createGroupSchema = z.object({
  group_name: z.string().min(3),
  group_code: z.string().min(3),
  chit_value: z.number().positive(),
  total_members: z.number().int().positive(),
  monthly_contribution: z.number().positive(),
  start_date: z.string().datetime(), // Expecting ISO string
  status: z.string().default("active"),
});

export const createGroup = async (req: Request, res: Response) => {
  try {
    const { group_name, group_code, chit_value, total_members, monthly_contribution, start_date, status } = req.body
    if (!group_name || !group_code || !chit_value || !total_members || !monthly_contribution || !start_date) {
      throw new Error("All fields are required");
    }
    const validatedData = createGroupSchema.parse({group_name, group_code, chit_value, total_members, monthly_contribution, start_date, status});

    const group = await groupService.createGroup({
      group_name: validatedData.group_name,
      group_code: validatedData.group_code,
      chit_value: validatedData.chit_value,
      total_members: validatedData.total_members,
      monthly_contribution: validatedData.monthly_contribution,
      start_date: validatedData.start_date, // Prisma handles string to DateTime if ISO
      status: validatedData.status,
    });
    res.status(201).json(serialize(group));
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};

export const getGroups = async (req: Request, res: Response) => {
  try {
    const groups = await groupService.getAllGroups();
    res.json(serialize(groups));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) throw new Error("Group ID is required");
    const group = await groupService.getGroupById(id);
    res.json(serialize(group));
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const updateGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) throw new Error("Group ID is required");
    const group = await groupService.updateGroup(id, req.body);
    res.json(serialize(group));
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateGroupStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) throw new Error("Group ID is required");
    const { status } = req.body;
    
    if (!status) {
        res.status(400).json({ error: "Status is required" });
        return;
    }

    const group = await groupService.updateGroupStatus(id, status);
    res.json(serialize(group));
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
