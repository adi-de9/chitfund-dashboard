import type { Request, Response } from "express";
import * as ledgerService from "../services/ledger.service";
import { z } from "zod";

const serialize = (data: any) => {
  return JSON.parse(
    JSON.stringify(data, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
};

export const getUserLedger = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) throw new Error("User ID is required");
    const ledger = await ledgerService.getUserLedger(userId);
    res.json(serialize(ledger));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getGroupLedger = async (req: Request, res: Response) => {
  try {
    const { groupId, userId } = req.params;
    if (!groupId || !userId) throw new Error("Group ID and User ID are required");
    const ledger = await ledgerService.getGroupLedger(groupId, userId);
    res.json(serialize(ledger));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

const addEntrySchema = z.object({
  userId: z.string(),
  groupId: z.string(),
  amount: z.number(),
  notes: z.string(),
});

export const addManualEntry = async (req: Request, res: Response) => {
  try {
    const { userId, groupId, amount, notes } = addEntrySchema.parse(req.body);
    const entry = await ledgerService.addManualEntry(userId, groupId, amount, notes);
    res.status(201).json(serialize(entry));
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
