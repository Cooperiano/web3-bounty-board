"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-gray-800 bg-gray-950">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold text-white">
          Web3 Bounty Board
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/create"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
          >
            Create Bounty
          </Link>
          <ConnectButton />
        </nav>
      </div>
    </header>
  );
}
