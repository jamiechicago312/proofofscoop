"use client";

import { useEffect, useState } from "react";
import { createPublicClient, fallback, formatUnits, http, isAddress, parseAbi } from "viem";
import { base } from "viem/chains";

const usdc = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;
const erc20 = parseAbi(["function balanceOf(address) view returns (uint256)"]);

export function WalletBalance({ address }: { address?: string }) {
  if (!address) return <><div><dt>Base USDC balance</dt><dd>Wallet is still being created.</dd></div><div><dt>Base ETH gas balance</dt><dd>Wallet is still being created.</dd></div></>;
  if (!isAddress(address)) return <><div><dt>Base USDC balance</dt><dd>Invalid wallet address.</dd></div><div><dt>Base ETH gas balance</dt><dd>Invalid wallet address.</dd></div></>;
  return <LoadedWalletBalance address={address} />;
}

function LoadedWalletBalance({ address }: { address: string }) {
  const [usdcState, setUsdcState] = useState("Loading…");
  const [ethState, setEthState] = useState("Loading…");
  useEffect(() => {
    // Base's public endpoint is rate-limited and eth_call can fail while
    // eth_getBalance still succeeds. Try configured and official endpoints.
    const rpcUrls = [process.env.NEXT_PUBLIC_BASE_RPC_URL, "https://mainnet.base.org", "https://mainnet-preconf.base.org"]
      .filter((url, index, urls): url is string => Boolean(url) && urls.indexOf(url) === index);
    const client = createPublicClient({ chain: base, transport: fallback(rpcUrls.map((url) => http(url, { timeout: 8_000 }))) });
    let active = true;
    client.readContract({ address: usdc, abi: erc20, functionName: "balanceOf", args: [address as `0x${string}`] })
      .then((balance) => { if (active) setUsdcState(`${formatUnits(balance, 6)} USDC`); })
      .catch(() => { if (active) setUsdcState("Temporarily unavailable — refresh to retry"); });
    client.getBalance({ address: address as `0x${string}` })
      .then((balance) => { if (active) setEthState(`${formatUnits(balance, 18)} ETH`); })
      .catch(() => { if (active) setEthState("Temporarily unavailable — refresh to retry"); });
    return () => { active = false; };
  }, [address]);
  return <><div><dt>Base USDC balance</dt><dd>{usdcState}</dd></div><div><dt>Base ETH gas balance</dt><dd>{ethState}</dd></div></>;
}
