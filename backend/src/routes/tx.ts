import { Router, Request, Response } from "express";
import db from "../db";

const router = Router();

interface TxRow {
  id: number;
  tx_hash: string;
  bounty_id: number;
  action: string;
  from_address: string;
  to_address: string;
  amount_wei: string;
  chain_id: number;
  status: string;
  created_at: string;
}

router.post("/", (req: Request, res: Response) => {
  const { tx_hash, bounty_id, action, from_address, to_address, amount_wei, chain_id, status } =
    req.body;

  if (!tx_hash || bounty_id === undefined || !action || !from_address) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  db.prepare(
    `INSERT OR REPLACE INTO transactions (tx_hash, bounty_id, action, from_address, to_address, amount_wei, chain_id, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(tx_hash, bounty_id, action, from_address, to_address || "", amount_wei || "0", chain_id || 11155111, status || "pending");

  const tx = db.prepare("SELECT * FROM transactions WHERE tx_hash = ?").get(tx_hash) as TxRow;
  res.status(201).json(tx);
});

router.get("/:hash", (req: Request, res: Response) => {
  const tx = db.prepare("SELECT * FROM transactions WHERE tx_hash = ?").get(req.params.hash) as TxRow | undefined;
  if (!tx) {
    res.status(404).json({ error: "Transaction not found" });
    return;
  }
  res.json(tx);
});

router.get("/", (req: Request, res: Response) => {
  const bountyId = req.query.bounty_id;
  let txs: TxRow[];

  if (bountyId) {
    txs = db
      .prepare("SELECT * FROM transactions WHERE bounty_id = ? ORDER BY created_at DESC")
      .all(Number(bountyId)) as TxRow[];
  } else {
    txs = db.prepare("SELECT * FROM transactions ORDER BY created_at DESC LIMIT 50").all() as TxRow[];
  }

  res.json(txs);
});

export default router;
