import type { Request, Response, NextFunction } from "express";

export const logDetails = (req: Request, res: Response, next: NextFunction) => {
  res.on("finish", () => {
    console.log(`${req.method} ${req.url} - Status: ${res.statusCode}`);
  });
  next();
};
