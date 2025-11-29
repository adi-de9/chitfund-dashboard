import type { Request, Response } from "express";
import * as cycleService from "../services/cycle.service";

// Helper to handle BigInt serialization
const serialize = (data: any) => {
  return JSON.parse(JSON.stringify(data, (key, value) =>
    typeof value === 'bigint'
      ? value.toString()
      : value
  ));
};

export const createCycle = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    if (!groupId) throw new Error("Group ID is required");
    const cycle = await cycleService.createCycle(groupId);
    res.status(201).json(serialize(cycle));
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getCycles = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    if (!groupId) throw new Error("Group ID is required");
    const cycles = await cycleService.getCyclesByGroupId(groupId);
    res.json(serialize(cycles));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCycle = async (req: Request, res: Response) => {
  try {
    const { cycleId } = req.params;
    if (!cycleId) throw new Error("Cycle ID is required");
    const cycle = await cycleService.getCycleById(cycleId);
    res.json(serialize(cycle));
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};
