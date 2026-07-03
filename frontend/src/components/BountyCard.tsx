"use client";

import { formatEther } from "viem";

export type BountyData = {
  id: bigint;
  creator: string;
  worker: string;
  title: string;
  description: string;
  amount: bigint;
  status: number;
  createdAt: bigint;
};

const statusLabels = ["Open", "Submitted", "Approved", "Cancelled"];
const statusColors = [
  "bg-green-900 text-green-300",
  "bg-yellow-900 text-yellow-300",
  "bg-blue-900 text-blue-300",
  "bg-red-900 text-red-300",
];

export default function BountyCard({
  bounty,
  userAddress,
  onAction,
  disabled,
}: {
  bounty: BountyData;
  userAddress?: string;
  onAction?: (bounty: BountyData, action: string) => void;
  disabled?: boolean;
}) {
  const isCreator =
    userAddress && bounty.creator.toLowerCase() === userAddress.toLowerCase();
  const isWorker =
    userAddress && bounty.worker.toLowerCase() === userAddress.toLowerCase();

  const canSubmit = bounty.status === 0 && !isCreator;
  const canApprove = bounty.status === 1 && isCreator;
  const canCancel = bounty.status === 0 && isCreator;

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-900 p-6 transition-colors hover:border-gray-600">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-white">{bounty.title}</h3>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[bounty.status]}`}
        >
          {statusLabels[bounty.status]}
        </span>
      </div>
      <p className="mb-4 text-sm text-gray-400 line-clamp-2">
        {bounty.description}
      </p>
      <div className="mb-4 flex flex-wrap gap-3 text-xs text-gray-500">
        <span className="rounded bg-gray-800 px-2 py-1">
          #{bounty.id.toString()}
        </span>
        <span className="rounded bg-gray-800 px-2 py-1">
          {bounty.creator.slice(0, 6)}...{bounty.creator.slice(-4)}
        </span>
        {bounty.worker !== "0x0000000000000000000000000000000000000000" && (
          <span className="rounded bg-gray-800 px-2 py-1">
            {bounty.worker.slice(0, 6)}...{bounty.worker.slice(-4)}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xl font-bold text-blue-400">
          {formatEther(bounty.amount)} ETH
        </span>
        <div className="flex gap-2">
          {onAction && canSubmit && (
            <button
              onClick={() => onAction(bounty, "submit")}
              disabled={disabled}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500 disabled:opacity-50 transition-colors"
            >
              Submit Work
            </button>
          )}
          {onAction && canApprove && (
            <button
              onClick={() => onAction(bounty, "approve")}
              disabled={disabled}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
            >
              Approve & Pay
            </button>
          )}
          {onAction && canCancel && (
            <button
              onClick={() => onAction(bounty, "cancel")}
              disabled={disabled}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
