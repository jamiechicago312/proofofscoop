import { createPublicClient, decodeFunctionData, getAddress, http, isAddress, parseAbi, parseEventLogs, type Hex } from "viem";
import { base } from "viem/chains";

export const BASE_CHAIN_ID = 8453;
export const BASE_USDC_ADDRESS = "0x833589fCD6EDb6E08f4c7C32D4f71b54bdA02913" as const;
export const VERIFICATION_AMOUNT = BigInt(1_000_000);
const transferAbi = parseAbi(["function transfer(address to, uint256 amount) returns (bool)", "event Transfer(address indexed from, address indexed to, uint256 value)"]);

export function getVerificationRecipient() {
  const value = process.env.NEXT_PUBLIC_VERIFICATION_RECIPIENT_ADDRESS;
  if (!value || !isAddress(value)) throw new Error("NEXT_PUBLIC_VERIFICATION_RECIPIENT_ADDRESS is not configured.");
  return getAddress(value);
}

function client() {
  return createPublicClient({ chain: base, transport: http(process.env.BASE_RPC_URL ?? "https://mainnet.base.org") });
}

export type BaseVerificationResult = { status: "pending" | "confirmed" | "failed"; reason?: string };

export async function verifyBaseTransaction(hash: Hex, expectedSender: string): Promise<BaseVerificationResult> {
  const recipient = getVerificationRecipient();
  const baseClient = client();
  if (await baseClient.getChainId() !== BASE_CHAIN_ID) return { status: "failed", reason: "Base RPC is not connected to Base mainnet." };
  const transaction = await baseClient.getTransaction({ hash });
  if (!transaction.to || getAddress(transaction.to) !== getAddress(BASE_USDC_ADDRESS)) return { status: "failed", reason: "Transaction target is not Base USDC." };
  if (getAddress(transaction.from) !== getAddress(expectedSender)) return { status: "failed", reason: "Transaction sender does not match the authenticated wallet." };
  if (transaction.value !== BigInt(0)) return { status: "failed", reason: "USDC transfer must not include native ETH." };
  try {
    const decoded = decodeFunctionData({ abi: transferAbi, data: transaction.input });
    if (decoded.functionName !== "transfer" || getAddress(decoded.args[0]) !== recipient || decoded.args[1] !== VERIFICATION_AMOUNT) return { status: "failed", reason: "Transfer recipient or amount is invalid." };
  } catch { return { status: "failed", reason: "Transaction data is not a USDC transfer." }; }

  let receipt;
  try { receipt = await baseClient.getTransactionReceipt({ hash }); }
  catch (error) { if (error instanceof Error && error.name === "TransactionReceiptNotFoundError") return { status: "pending" }; throw error; }
  if (receipt.status !== "success") return { status: "failed", reason: "Transaction execution failed." };
  const transferLogs = parseEventLogs({ abi: transferAbi, eventName: "Transfer", logs: receipt.logs, strict: false });
  const matchingLog = transferLogs.some((log) => log.address.toLowerCase() === BASE_USDC_ADDRESS.toLowerCase() && log.args.from && getAddress(log.args.from) === getAddress(expectedSender) && log.args.to && getAddress(log.args.to) === recipient && log.args.value === VERIFICATION_AMOUNT);
  return matchingLog ? { status: "confirmed" } : { status: "failed", reason: "Receipt does not contain the expected USDC transfer." };
}
