"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { BOUNTY_BOARD_ADDRESS, BOUNTY_BOARD_ABI } from "@/lib/contract";
import { useState, useCallback, useEffect } from "react";
import type { BountyData } from "@/components/BountyCard";

export function useBountyBoard() {
  const [pendingTx, setPendingTx] = useState<`0x${string}` | undefined>();
  const [actionLabel, setActionLabel] = useState("");

  const { data: bountiesRaw, refetch: refetchBounties } = useReadContract({
    address: BOUNTY_BOARD_ADDRESS,
    abi: BOUNTY_BOARD_ABI,
    functionName: "getAllBounties",
  });

  const bounties: BountyData[] = (bountiesRaw as unknown as BountyData[]) || [];

  const { writeContractAsync } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, isError, error } = useWaitForTransactionReceipt({
    hash: pendingTx,
  });

  useEffect(() => {
    if (isSuccess || isError) {
      refetchBounties();
      const timer = setTimeout(() => {
        setPendingTx(undefined);
        setActionLabel("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, isError, refetchBounties]);

  const submitWork = useCallback(
    async (bountyId: bigint) => {
      try {
        setPendingTx(undefined);
        const tx = await writeContractAsync({
          address: BOUNTY_BOARD_ADDRESS,
          abi: BOUNTY_BOARD_ABI,
          functionName: "submitWork",
          args: [bountyId],
        });
        setPendingTx(tx);
        setActionLabel("Submitting work...");
      } catch (err) {
        console.error("submitWork failed:", err);
      }
    },
    [writeContractAsync]
  );

  const approveWork = useCallback(
    async (bountyId: bigint) => {
      try {
        setPendingTx(undefined);
        const tx = await writeContractAsync({
          address: BOUNTY_BOARD_ADDRESS,
          abi: BOUNTY_BOARD_ABI,
          functionName: "approveWork",
          args: [bountyId],
        });
        setPendingTx(tx);
        setActionLabel("Approving and paying...");
      } catch (err) {
        console.error("approveWork failed:", err);
      }
    },
    [writeContractAsync]
  );

  const cancelBounty = useCallback(
    async (bountyId: bigint) => {
      try {
        setPendingTx(undefined);
        const tx = await writeContractAsync({
          address: BOUNTY_BOARD_ADDRESS,
          abi: BOUNTY_BOARD_ABI,
          functionName: "cancelBounty",
          args: [bountyId],
        });
        setPendingTx(tx);
        setActionLabel("Cancelling bounty...");
      } catch (err) {
        console.error("cancelBounty failed:", err);
      }
    },
    [writeContractAsync]
  );

  return {
    bounties,
    pendingTx,
    isConfirming,
    isSuccess,
    isError,
    error,
    actionLabel,
    submitWork,
    approveWork,
    cancelBounty,
    refetchBounties,
  };
}
