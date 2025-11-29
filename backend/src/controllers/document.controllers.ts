import type { Request, Response } from "express";
import * as documentService from "../services/document.service";
import { z } from "zod";

const serialize = (data: any) => {
  return JSON.parse(
    JSON.stringify(data, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
};

const uploadSchema = z.object({
  userId: z.string(),
  docType: z.enum(["aadhaar", "pan", "photo"]),
  fileUrl: z.string().url(),
});

export const uploadDocument = async (req: Request, res: Response) => {
  try {
    const { userId, docType, fileUrl } = uploadSchema.parse(req.body);
    const doc = await documentService.uploadDocument(userId, docType, fileUrl);
    res.status(201).json(serialize(doc));
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getDocuments = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) throw new Error("User ID is required");
    const docs = await documentService.getDocuments(userId);
    res.json(serialize(docs));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) throw new Error("Document ID is required");
    await documentService.deleteDocument(id);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
