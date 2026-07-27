"use client";

import { useEffect, useState } from "react";
import { createPublicClient, formatUnits, http, parseAbi } from "viem";
import { base } from "viem/chains";

const usdc = "0x833589fCD6EDb6E08f4c7C32D4f71b54bdA02913" as const;
const erc20 = parseAbi(["function balanceOf(address) view returns (uint256)"]);

export function WalletBalance({ address }: { address?: string }) {
  const [usdcState, setUsdcState] = useState("Loading…");
  const [ethState, setEthState] = useState("Loading…");
  useEffect(() => {
    if (!address) { setUsdcState("Wallet is still being created."); setEthState("Wallet is still being created."); return; }
    const client = createPublicClient({ chain: base, transport: http("https://mainnet.base.org") });
    client.readContract({ address: usdc, abi: erc20, functionName: "balanceOf", args: [address as `0x${string}`] })
      .then((balance) => setUsdcState(`${formatUnits(balance, 6)} USDC`))
      .catch(() => setUsdcState("Unavailable"));
    client.getBalance({ address: address as `0x${string}` })
      .then((balance) => setEthState(`${formatUnits(balance, 18)} ETH`))
      .catch(() => setEthState("Unavailable"));
  }, [address]);
  return <><div><dt>Base USDC balance</dt><dd>{usdcState}</dd></div><div><dt>Base ETH gas balance</dt><dd>{ethState}</dd></div></>;
}
