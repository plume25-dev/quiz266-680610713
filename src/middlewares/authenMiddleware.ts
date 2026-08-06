import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

import { type CustomRequest, type UserPayload } from "../libs/types.js";

export const authenticateToken = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(403).json({
      success: false,
      message: "Forbidden access",
    });
  }

  const secret = process.env.JWT_SECRET || "your-secret-key";

  jwt.verify(token, secret, function (err, decoded) {
    if (err) {
      return res.status(403).json({
        success: false,
        message: "Forbidden access",
      });
    }

    req.user = decoded as UserPayload;
    req.token = token;
    next();
  });
};