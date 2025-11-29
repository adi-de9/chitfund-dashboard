import type { Request, Response } from "express";
import * as notificationService from "../services/notification.service";
import { z } from "zod";

const serialize = (data: any) => {
  return JSON.parse(
    JSON.stringify(data, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
};

const sendSchema = z.object({
  userId: z.string(),
  messageType: z.string(),
  channel: z.enum(["sms", "whatsapp", "email"]),
});

export const sendNotification = async (req: Request, res: Response) => {
  try {
    const { userId, messageType, channel } = sendSchema.parse(req.body);
    const notification = await notificationService.sendNotification(
      userId,
      messageType,
      channel
    );
    res.status(201).json(serialize(notification));
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const sendPaymentAlert = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) throw new Error("User ID is required");
    const notification = await notificationService.sendPaymentAlert(userId);
    res.status(201).json(serialize(notification));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) throw new Error("User ID is required");
    const notifications = await notificationService.getNotifications(userId);
    res.json(serialize(notifications));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
