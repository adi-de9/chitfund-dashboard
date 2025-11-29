import type { Request, Response } from "express";
import * as contributionService from "../services/contribution.service";
import { z } from "zod";

const serialize = (data: any) => {
  return JSON.parse(
    JSON.stringify(data, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
};

export const initContributions = async (req: Request, res: Response) => {
  try {
    const { cycleId } = req.params;
    if (!cycleId) throw new Error("Cycle ID is required");
    const contributions = await contributionService.initContributions(cycleId);
    res.status(201).json(serialize(contributions));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getContributions = async (req: Request, res: Response) => {
  try {
    const { cycleId } = req.params;
    if (!cycleId) throw new Error("Cycle ID is required");
    const contributions = await contributionService.getContributions(cycleId);
    res.json(serialize(contributions));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

const paySchema = z.object({
  amount: z.number(),
  paymentMode: z.enum(["upi", "cash", "bank"]),
  referenceNo: z.string().optional(),
});

export const recordPayment = async (req: Request, res: Response) => {
  try {
    const { contributionId } = req.params;
    if (!contributionId) throw new Error("Contribution ID is required");
    const { amount, paymentMode, referenceNo } = paySchema.parse(req.body);
    const contribution = await contributionService.recordPayment(
      contributionId,
      amount,
      paymentMode,
      referenceNo
    );
    res.json(serialize(contribution));
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) throw new Error("ID is required");
    const { status } = req.body;
    const contribution = await contributionService.updateContributionStatus(
      id,
      status
    );
    res.json(serialize(contribution));
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

const subPaymentSchema = z.object({
  contributionId: z.string(),
  userId: z.string(),
  payerName: z.string(),
  amount: z.number(),
});

export const addSubPayment = async (req: Request, res: Response) => {
  try {
    const { contributionId, userId, payerName, amount } = subPaymentSchema.parse(
      req.body
    );
    const contribution = await contributionService.addSubPayment(
      contributionId,
      userId,
      payerName,
      amount
    );
    res.json(serialize(contribution));
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getSubPayments = async (req: Request, res: Response) => {
  try {
    const { contributionId } = req.params;
    if (!contributionId) throw new Error("Contribution ID is required");
    const payments = await contributionService.getSubPayments(contributionId);
    res.json(serialize(payments));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
