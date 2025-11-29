import type { Request, Response } from "express";
import * as settingsService from "../services/settings.service";
import { z } from "zod";

const serialize = (data: any) => {
  return JSON.parse(
    JSON.stringify(data, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
};

export const getSettings = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    if (!groupId) throw new Error("Group ID is required");
    const settings = await settingsService.getSettings(groupId);
    res.json(serialize(settings));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

const updateSettingsSchema = z.object({
  dueDate: z.number().optional(),
  penaltyType: z.string().optional(),
  penaltyValue: z.number().optional(),
});

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    if (!groupId) throw new Error("Group ID is required");
    const validatedData = updateSettingsSchema.parse(req.body);
    const settings = await settingsService.updateSettings(groupId, validatedData);
    res.json(serialize(settings));
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
