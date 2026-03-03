// Mock transaction simulator — mirrors the real tx flow from margin/earn
// Pattern: wallet_request → approving → approved → submitting → confirming → confirmed
// Mimics RainbowKit / wallet popup interaction with realistic delays

import type { WalletTxStep } from "@/components/ui/wallet-tx-modal";

export interface MockTxParams {
  action: string;
  asset: string;
  amount: number;
  delayMs?: number;
  failRate?: number; // 0-1, default 0.05 (5%)
}

export interface MockTxResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

// Keep backward compat for simple inline status text
export type TxStatusCallback = (status: "approving" | "confirming" | "confirmed" | "failed") => void;

// New granular callback for WalletTxModal
export type WalletTxStatusCallback = (step: WalletTxStep, txHash?: string) => void;

const randomHex = (length: number): string => {
  const chars = "0123456789abcdef";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Simulates a blockchain transaction with realistic wallet-like flow.
 * Follows the pattern:
 *   1. wallet_request - Requesting wallet connection (400ms)
 *   2. approving - User approves token spend in wallet popup (600ms)
 *   3. approved - Token approval confirmed (300ms)
 *   4. submitting - Confirm tx in wallet (500ms)
 *   5. confirming - Waiting for on-chain confirmation (800ms)
 *   6. confirmed / failed - Final result
 */
export const mockTransaction = async (
  params: MockTxParams,
  onStatus?: TxStatusCallback,
  onWalletStep?: WalletTxStatusCallback
): Promise<MockTxResult> => {
  const { action, asset, amount, delayMs, failRate = 0.05 } = params;
  const baseDelay = delayMs ?? 2500;
  const step = Math.floor(baseDelay / 6);

  try {
    console.log(`[MockTx] Starting ${action}: ${amount} ${asset}`);

    // Step 1: Requesting wallet
    onWalletStep?.("wallet_request");
    await delay(step + Math.random() * 200);

    // Step 2: Approving token
    onStatus?.("approving");
    onWalletStep?.("approving");
    await delay(step + Math.random() * 300);

    // Step 3: Token approved
    onWalletStep?.("approved");
    await delay(step * 0.5);

    // Step 4: Submitting transaction
    onWalletStep?.("submitting");
    await delay(step + Math.random() * 200);

    // Simulate random failure
    if (Math.random() < failRate) {
      onStatus?.("failed");
      onWalletStep?.("failed");
      console.log(`[MockTx] ${action} failed (simulated)`);
      return {
        success: false,
        error: `Transaction reverted: ${action} failed for ${amount} ${asset}`,
      };
    }

    // Step 5: Confirming on-chain
    const txHash = `0x${randomHex(64)}`;
    onStatus?.("confirming");
    onWalletStep?.("confirming", txHash);
    await delay(step * 1.5 + Math.random() * 400);

    // Step 6: Confirmed
    onStatus?.("confirmed");
    onWalletStep?.("confirmed", txHash);
    console.log(`[MockTx] ${action} confirmed: ${txHash}`);

    return {
      success: true,
      txHash,
    };
  } catch (error: any) {
    onStatus?.("failed");
    onWalletStep?.("failed");
    return {
      success: false,
      error: error.message || `${action} failed unexpectedly`,
    };
  }
};
