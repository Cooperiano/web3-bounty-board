"use client";

import { Header } from "@/components/Header";
import BountyCard, { BountyData } from "@/components/BountyCard";
import { useBountyBoard } from "@/hooks/useBountyBoard";
import { useAccount } from "wagmi";

export default function Home() {
  const { address } = useAccount();
  const {
    bounties,
    submitWork,
    approveWork,
    cancelBounty,
    isSuccess,
    isError,
    isConfirming,
    pendingTx,
    actionLabel,
    error,
  } = useBountyBoard();

  function handleAction(bounty: BountyData, action: string) {
    switch (action) {
      case "submit":
        submitWork(bounty.id);
        break;
      case "approve":
        approveWork(bounty.id);
        break;
      case "cancel":
        cancelBounty(bounty.id);
        break;
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Available Bounties</h1>
          <p className="mt-2 text-gray-400">
            Browse and claim on-chain bounties. Connect your wallet to get started.
          </p>
        </div>

        {pendingTx && (
          <div className="mb-6 rounded-lg border border-gray-700 bg-gray-900 p-4">
            <div className="flex items-center gap-3">
              {isConfirming && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
              )}
              <div>
                <p className="text-sm text-gray-300">
                  {isConfirming ? actionLabel || "Confirming transaction..." : "Transaction submitted"}
                </p>
                <p className="break-all font-mono text-xs text-blue-400">{pendingTx}</p>
              </div>
            </div>
            {isSuccess && (
              <p className="mt-2 text-sm text-green-400">Transaction confirmed!</p>
            )}
            {isError && (
              <p className="mt-2 text-sm text-red-400">
                {error?.message?.slice(0, 100) || "Transaction failed"}
              </p>
            )}
          </div>
        )}

        {bounties.length === 0 ? (
          <div className="rounded-xl border border-gray-700 bg-gray-900 p-12 text-center">
            <p className="text-lg text-gray-400">No bounties yet. Be the first to create one!</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {bounties.map((bounty) => (
              <BountyCard
                key={bounty.id.toString()}
                bounty={bounty}
                userAddress={address}
                onAction={handleAction}
                disabled={isConfirming}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
