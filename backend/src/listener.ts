import { createPublicClient, http, parseAbiItem } from "viem";
import { sepolia } from "viem/chains";
import * as dotenv from "dotenv";
import db from "./db";

dotenv.config();

const BOUNTY_BOARD_ADDRESS = (process.env.BOUNTY_BOARD_ADDRESS ||
  "0x0000000000000000000000000000000000000000") as `0x${string}`;
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://sepolia.gateway.tenderly.co";

const client = createPublicClient({
  chain: sepolia,
  transport: http(SEPOLIA_RPC_URL),
});

const BountyCreated = parseAbiItem(
  "event BountyCreated(uint256 indexed bountyId, address indexed creator, uint256 amount)"
);
const WorkSubmitted = parseAbiItem(
  "event WorkSubmitted(uint256 indexed bountyId, address indexed worker)"
);
const BountyApproved = parseAbiItem(
  "event BountyApproved(uint256 indexed bountyId, address indexed worker, uint256 amount)"
);
const BountyCancelled = parseAbiItem(
  "event BountyCancelled(uint256 indexed bountyId)"
);

async function startListening() {
  console.log(`Listening for events on ${BOUNTY_BOARD_ADDRESS}...`);

  client.watchContractEvent({
    address: BOUNTY_BOARD_ADDRESS,
    abi: [BountyCreated, WorkSubmitted, BountyApproved, BountyCancelled],
    onLogs: (logs) => {
      for (const log of logs) {
        const eventName = log.eventName;
        console.log(`[${new Date().toISOString()}] ${eventName}`, log.args);

        try {
          if (eventName === "BountyCreated") {
            const { bountyId, creator, amount } = log.args as {
              bountyId: bigint;
              creator: string;
              amount: bigint;
            };
            db.prepare(
              `INSERT OR IGNORE INTO tasks (bounty_id, title, creator_address, amount_wei, status, tx_hash)
               VALUES (?, ?, ?, ?, 'Open', ?)`
            ).run(
              Number(bountyId),
              `Bounty #${bountyId}`,
              creator.toLowerCase(),
              amount.toString(),
              log.transactionHash
            );

            db.prepare(
              `INSERT OR IGNORE INTO transactions (tx_hash, bounty_id, action, from_address, amount_wei, status)
               VALUES (?, ?, 'create', ?, ?, 'confirmed')`
            ).run(log.transactionHash, Number(bountyId), creator.toLowerCase(), amount.toString());
          }

          if (eventName === "WorkSubmitted") {
            const { bountyId, worker } = log.args as {
              bountyId: bigint;
              worker: string;
            };
            db.prepare(
              `UPDATE tasks SET status = 'Submitted', worker_address = ?, updated_at = datetime('now') WHERE bounty_id = ?`
            ).run(worker.toLowerCase(), Number(bountyId));

            db.prepare(
              `INSERT OR IGNORE INTO transactions (tx_hash, bounty_id, action, from_address, to_address, status)
               VALUES (?, ?, 'submit', ?, '', 'confirmed')`
            ).run(log.transactionHash, Number(bountyId), worker.toLowerCase());
          }

          if (eventName === "BountyApproved") {
            const { bountyId, worker, amount } = log.args as {
              bountyId: bigint;
              worker: string;
              amount: bigint;
            };
            db.prepare(
              `UPDATE tasks SET status = 'Approved', updated_at = datetime('now') WHERE bounty_id = ?`
            ).run(Number(bountyId));

            db.prepare(
              `INSERT OR IGNORE INTO transactions (tx_hash, bounty_id, action, from_address, to_address, amount_wei, status)
               VALUES (?, ?, 'approve', (SELECT creator_address FROM tasks WHERE bounty_id = ?), ?, ?, 'confirmed')`
            ).run(log.transactionHash, Number(bountyId), Number(bountyId), worker.toLowerCase(), amount.toString());
          }

          if (eventName === "BountyCancelled") {
            const { bountyId } = log.args as {
              bountyId: bigint;
            };
            db.prepare(
              `UPDATE tasks SET status = 'Cancelled', updated_at = datetime('now') WHERE bounty_id = ?`
            ).run(Number(bountyId));

            db.prepare(
              `INSERT OR IGNORE INTO transactions (tx_hash, bounty_id, action, from_address, status)
               VALUES (?, ?, 'cancel', (SELECT creator_address FROM tasks WHERE bounty_id = ?), 'confirmed')`
            ).run(log.transactionHash, Number(bountyId), Number(bountyId));
          }
        } catch (err) {
          console.error("Error processing event:", err);
        }
      }
    },
    onError: (error) => {
      console.error("Listener error:", error);
    },
  });
}

startListening();
