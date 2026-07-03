"use client";

import { Header } from "@/components/Header";
import BountyForm from "@/components/BountyForm";

export default function CreateBountyPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Create Bounty</h1>
          <p className="mt-2 text-gray-400">
            Fund a new bounty with ETH. The funds will be held in the smart contract until you
            approve the work.
          </p>
        </div>
        <BountyForm />
      </main>
    </div>
  );
}
