"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { BOUNTY_BOARD_ADDRESS, BOUNTY_BOARD_ABI } from "@/lib/contract";

export default function BountyForm() {
  const { isConnected } = useAccount();
  const { writeContractAsync, isPending: isWriting, data: txHash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !amount) return;

    try {
      await writeContractAsync({
        address: BOUNTY_BOARD_ADDRESS,
        abi: BOUNTY_BOARD_ABI,
        functionName: "createBounty",
        args: [title, description],
        value: parseEther(amount),
      });
    } catch (err) {
      console.error("Transaction failed:", err);
    }
  }

  if (!isConnected) {
    return (
      <div className="rounded-xl border border-gray-700 bg-gray-900 p-8 text-center">
        <p className="text-gray-400">Connect your wallet to create a bounty.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-gray-700 bg-gray-900 p-6">
      <h2 className="mb-6 text-2xl font-bold text-white">Create New Bounty</h2>

      {isSuccess ? (
        <div className="rounded-lg bg-green-900 p-4 text-green-300">
          Bounty created successfully!
          <br />
          <span className="text-xs break-all">Tx: {txHash}</span>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-gray-400">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              placeholder="e.g. Build a landing page"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-400">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              placeholder="Describe the task in detail..."
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-400">Reward (ETH)</label>
            <input
              type="number"
              step="0.001"
              min="0.001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              placeholder="0.01"
            />
          </div>
          <button
            type="submit"
            disabled={isWriting || isConfirming || !title || !amount}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
          >
            {isWriting
              ? "Confirm in wallet..."
              : isConfirming
                ? "Confirming..."
                : "Create Bounty"}
          </button>
        </div>
      )}
    </form>
  );
}
