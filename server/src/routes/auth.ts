import { Router, Request, Response } from "express";
import { streamClient } from "../lib/stream";
import User from "../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

// Register
router.post("/register", async (req: Request, res: Response): Promise<void> => {
  const { userId, userName, password } = req.body;

  if (!userId || !password) {
    res.status(400).json({ error: "UserId and password are required" });
    return;
  }

  try {
    const existingUser = await User.findOne({ userId });
    if (existingUser) {
      res.status(400).json({ error: "User ID already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. Sync with Stream
    await streamClient.upsertUser({
      id: userId,
      name: userName || userId,
      role: "user",
    });

    // 2. Sync with MongoDB
    const user = new User({
      userId,
      name: userName || userId,
      password: hashedPassword,
    });
    await user.save();

    const streamToken = streamClient.createToken(userId);
    const jwtToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({ token: streamToken, jwt: jwtToken, user });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Failed to register user" });
  }
});

// Login
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  const { userId, password } = req.body;

  if (!userId || !password) {
    res.status(400).json({ error: "UserId and password are required" });
    return;
  }

  try {
    const user = await User.findOne({ userId });
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Update last login
    user.lastLogin = new Date();
    user.metadata.totalSessions += 1;
    await user.save();

    const streamToken = streamClient.createToken(userId);
    const jwtToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });

    res.json({ token: streamToken, jwt: jwtToken, user });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Failed to login" });
  }
});

// Get user profile
router.get(
  "/user/:userId",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await User.findOne({ userId: req.params.userId });
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user profile" });
    }
  },
);

// Update user stats
router.patch(
  "/user/:userId/stats",
  async (req: Request, res: Response): Promise<void> => {
    const { field, increment } = req.body;
    try {
      const update: any = {};
      update[`metadata.${field}`] = increment;

      const user = await User.findOneAndUpdate(
        { userId: req.params.userId },
        { $inc: update },
        { new: true },
      );
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update stats" });
    }
  },
);

export default router;
