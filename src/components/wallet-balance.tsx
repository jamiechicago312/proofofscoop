"use client";

import { useEffect, useState } from "react";
import { createPublicClient, formatUnits, http, parseAbi } from "viem";
import { base } from "viem/chains";

const usdc = "0x833589fCD6EDb6E08f4c7C32D4f71b54bdA02913" as const;
const erc20 = parseAbi(["function balanceOf(address) view returns (uint256)"]);

export function WalletBalance({ address }: { address?: string }) {
  const [state, setState] = useState("Loading Base USDC balance…");
  useEffect(() => {
    if (!address) { setState("Embedded wallet is still being created."); return; }
    const client = createPublicClient({ chain: base, transport: http("https://mainnet.base.org") });
    client.readContract({ address: usdc, abi: erc20, functionName: "balanceOf", args: [address as `0x${string}`] })
      .then((balance) => setState(`${formatUnits(balance, 6)} USDC`))
      .catch(() => setState("Base USDC balance unavailable. Try again shortly."));
  }, [address]);
  return <div><dt>Base USDC balance</dt><dd>{state}</dd></div>;
}
