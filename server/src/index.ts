import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./lib/db";
import authRoutes from "./routes/auth";
import aiRoutes from "./routes/ai";
import agentRoutes from "./routes/agent";

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api", authRoutes);
app.use("/api", aiRoutes);
app.use("/api/agent", agentRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Promptly API is running");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
