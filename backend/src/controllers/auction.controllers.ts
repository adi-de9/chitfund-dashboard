import type { Request, Response } from "express";
import * as auctionService from "../services/auction.service";
import { z } from "zod";

const serialize = (data: any) => {
  return JSON.parse(
    JSON.stringify(data, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
};

const runAuctionSchema = z.object({
  bids: z.array(
    z.object({
      userId: z.string(),
      amount: z.number(),
    })
  ),
});

export const runAuction = async (req: Request, res: Response) => {
  try {
    const { cycleId } = req.params;
    if (!cycleId) throw new Error("Cycle ID is required");
    const { bids } = runAuctionSchema.parse(req.body);
    const auction = await auctionService.runAuction(cycleId, bids);
    res.status(201).json(serialize(auction));
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getAuction = async (req: Request, res: Response) => {
  try {
    const { cycleId } = req.params;
    if (!cycleId) throw new Error("Cycle ID is required");
    const auction = await auctionService.getAuction(cycleId);
    res.json(serialize(auction));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

const placeBidSchema = z.object({
  auctionId: z.string(),
  userId: z.string(),
  bidAmount: z.number(),
});

export const placeBid = async (req: Request, res: Response) => {
  try {
    const { auctionId, userId, bidAmount } = placeBidSchema.parse(req.body);
    const bid = await auctionService.placeBid(auctionId, userId, bidAmount);
    res.status(201).json(serialize(bid));
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getBids = async (req: Request, res: Response) => {
  try {
    const { auctionId } = req.params;
    if (!auctionId) throw new Error("Auction ID is required");
    const bids = await auctionService.getBids(auctionId);
    res.json(serialize(bids));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
