import { Router, type Request, type Response } from "express";
// import Zod validators
import {
  zUserId,
  zItemId,
  zItemPostBody,
  zItemPutBody,
  zItemDeleteBody
} from "../libs/zodValidators.js";
// import types
import type { Item } from "../libs/types.ts";
// import database
import { items } from "../db/db.ts";
//import uuid
import { v4 as uuidv4 } from 'uuid';

import { authenticateToken } from "../middlewares/authenMiddleware.ts";

const router = Router({ mergeParams: true });

// GET /api/vXXX/items/:userId 
router.get("", authenticateToken, function (req: Request, res: Response) {
  try {
    const userId = req.params.userId;
    const authUser = (req as any).user;

    if (authUser.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Forbidden access",
      });
    }

    const userItems = items.filter(function (item: Item) {
      return item.userId === userId;
    });

    if (userItems.length === 0) {
      return res.status(404).json({
        success: false,
        message: `items for user ID ${userId} not found`,
      });
    }

    return res.status(200).json({
      success: true,
      data: userItems,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something is wrong, please try again",
    });
  }
});

// POST /api/vXXX/items/:userId, body = {new item data}
// add a new Item for userId
router.post("/", authenticateToken, function (req: Request, res: Response) {
  try {
    const userId = req.params.userId;
    const authUser = (req as any).user;

    if (authUser.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Forbidden access",
      });
    }

    const newItem: Item = {
      userId: userId,
      itemId: uuidv4(),
      product_name: req.body.product_name,
      unit_price: req.body.unit_price,
      quantity: req.body.quantity,
      category: req.body.category,
    };

    items.push(newItem);

    return res.status(201).json({
      success: true,
      message: "New Item has been added successfully",
      data: newItem,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something is wrong, please try again",
    });
  }
});

// Delete /api/vXXX/items/:userId
router.delete("/", authenticateToken, function (req: Request, res: Response) {
  try {
    const userId = req.params.userId;
    const authUser = (req as any).user;

    if (authUser.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Forbidden access",
      });
    }

    const itemId = req.body.itemId;

    const index = items.findIndex(function (item: Item) {
      return item.userId === userId && item.itemId === itemId;
    });

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: `There are no items with item ID ${itemId} for user ID ${userId}`,
      });
    }

    items.splice(index, 1);

    const remainingItems = items.filter(function (item: Item) {
      return item.userId === userId;
    });

    return res.status(200).json({
      success: true,
      message: `Item ID ${itemId} for user ID ${userId} has been deleted successfully`,
      data: remainingItems,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something is wrong, please try again",
    });
  }
});

export default router;