import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_ACCESS_SECRET } from "../constants";

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.accessToken;

console.log(token);

  if (!token) {
    res.status(401).json({ error: "Access denied. No token provided." });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as { userId: string; role: any };

    req.user = decoded;
    next();
  } catch (error) {
    
    res.status(400).json({ error: "Invalid token" });
  }
};

export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: "Access denied. Not authenticated." });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: "Access denied. Insufficient permissions." });
      return;
    }

    next();
  };
};
