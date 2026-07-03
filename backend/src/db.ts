import Database from "better-sqlite3";
import path from "path";

const DB_PATH = process.env.DB_PATH || path.join(__dirname, "..", "data.db");

const db = new Database(DB_PATH);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bounty_id INTEGER NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    creator_address TEXT NOT NULL,
    worker_address TEXT DEFAULT '',
    amount_wei TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Open',
    tx_hash TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tx_hash TEXT NOT NULL UNIQUE,
    bounty_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    from_address TEXT NOT NULL,
    to_address TEXT DEFAULT '',
    amount_wei TEXT DEFAULT '0',
    chain_id INTEGER DEFAULT 11155111,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

export default db;
