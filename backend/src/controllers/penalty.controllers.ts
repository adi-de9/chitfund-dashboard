import type { Request, Response } from "express";
import * as penaltyService from "../services/penalty.service";
import { z } from "zod";

const serialize = (data: any) => {
  return JSON.parse(
    JSON.stringify(data, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
};

const applyPenaltySchema = z.object({
  amount: z.number(),
  reason: z.string(),
});

export const applyPenalty = async (req: Request, res: Response) => {
  try {
    const { contributionId } = req.params;
    if (!contributionId) throw new Error("Contribution ID is required");
    const { amount, reason } = applyPenaltySchema.parse(req.body);
    const penalty = await penaltyService.applyPenalty(
      contributionId,
      amount,
      reason
    );
    res.status(201).json(serialize(penalty));
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const autoCheckPenalties = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    if (!groupId) throw new Error("Group ID is required");
    const penalties = await penaltyService.autoCheckPenalties(groupId);
    res.json(serialize(penalties));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPenalties = async (req: Request, res: Response) => {
  try {
    const { cycleId } = req.params;
    if (!cycleId) throw new Error("Cycle ID is required");
    const penalties = await penaltyService.getPenalties(cycleId);
    res.json(serialize(penalties));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
