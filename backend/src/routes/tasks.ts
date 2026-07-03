import { Router, Request, Response } from "express";
import db from "../db";

const router = Router();

interface TaskRow {
  id: number;
  bounty_id: number;
  title: string;
  description: string;
  creator_address: string;
  worker_address: string;
  amount_wei: string;
  status: string;
  tx_hash: string;
  created_at: string;
  updated_at: string;
}

router.get("/", (_req: Request, res: Response) => {
  const tasks = db.prepare("SELECT * FROM tasks ORDER BY created_at DESC").all() as TaskRow[];
  res.json(tasks);
});

router.get("/:id", (req: Request, res: Response) => {
  const task = db.prepare("SELECT * FROM tasks WHERE bounty_id = ?").get(req.params.id) as TaskRow | undefined;
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  res.json(task);
});

router.post("/", (req: Request, res: Response) => {
  const { bounty_id, title, description, creator_address, amount_wei, tx_hash } = req.body;

  if (!bounty_id || !title || !creator_address || !amount_wei) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const existing = db.prepare("SELECT id FROM tasks WHERE bounty_id = ?").get(bounty_id);
  if (existing) {
    res.status(409).json({ error: "Task already exists" });
    return;
  }

  db.prepare(
    `INSERT INTO tasks (bounty_id, title, description, creator_address, amount_wei, status, tx_hash)
     VALUES (?, ?, ?, ?, ?, 'Open', ?)`
  ).run(bounty_id, title, description || "", creator_address, amount_wei, tx_hash || "");

  const task = db.prepare("SELECT * FROM tasks WHERE bounty_id = ?").get(bounty_id) as TaskRow;
  res.status(201).json(task);
});

router.patch("/:id", (req: Request, res: Response) => {
  const { status, worker_address, tx_hash } = req.body;
  const bountyId = parseInt(req.params.id, 10);

  const task = db.prepare("SELECT * FROM tasks WHERE bounty_id = ?").get(bountyId) as TaskRow | undefined;
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  const updates: string[] = [];
  const values: (string | number)[] = [];

  if (status) {
    updates.push("status = ?");
    values.push(status);
  }
  if (worker_address !== undefined) {
    updates.push("worker_address = ?");
    values.push(worker_address);
  }
  if (tx_hash) {
    updates.push("tx_hash = ?");
    values.push(tx_hash);
  }

  if (updates.length > 0) {
    updates.push("updated_at = datetime('now')");
    values.push(bountyId);
    db.prepare(`UPDATE tasks SET ${updates.join(", ")} WHERE bounty_id = ?`).run(...values);
  }

  const updated = db.prepare("SELECT * FROM tasks WHERE bounty_id = ?").get(bountyId) as TaskRow;
  res.json(updated);
});

export default router;
