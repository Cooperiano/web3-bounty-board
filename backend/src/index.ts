import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import tasksRouter from "./routes/tasks";
import txRouter from "./routes/tx";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api/tasks", tasksRouter);
app.use("/api/tx", txRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

export default app;
