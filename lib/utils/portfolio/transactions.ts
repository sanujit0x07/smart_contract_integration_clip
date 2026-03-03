// Mock portfolio deposit/withdraw transactions

import { mockTransaction, type TxStatusCallback, type WalletTxStatusCallback } from "@/lib/utils/mock/mockTransaction";
import { addMockBalance, deductMockBalance } from "@/lib/utils/mock/mockBalances";

export interface PortfolioDepositParams {
  asset: string;
  amount: number;
}

export interface PortfolioTxResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

/**
 * Simulate depositing into the portfolio (wallet → margin account).
 * This mirrors how margin depositTx works.
 */
export const portfolioDepositTx = async (
  params: PortfolioDepositParams,
  onStatus?: TxStatusCallback,
  onWalletStep?: WalletTxStatusCallback
): Promise<PortfolioTxResult> => {
  const { asset, amount } = params;

  // Deduct from wallet balance
  const hasBalance = deductMockBalance(asset, amount, "wallet");
  if (!hasBalance) {
    return { success: false, error: `Insufficient ${asset} wallet balance` };
  }

  const result = await mockTransaction(
    { action: "portfolio-deposit", asset, amount },
    onStatus,
    onWalletStep
  );

  if (result.success) {
    // Add to margin balance
    addMockBalance(asset, amount, "margin");
  } else {
    // Refund on failure
    addMockBalance(asset, amount, "wallet");
  }

  return result;
};

/**
 * Simulate withdrawing from portfolio (margin account → wallet).
 * This mirrors how margin withdrawTx works.
 */
export const portfolioWithdrawTx = async (
  params: PortfolioDepositParams,
  onStatus?: TxStatusCallback,
  onWalletStep?: WalletTxStatusCallback
): Promise<PortfolioTxResult> => {
  const { asset, amount } = params;

  // Deduct from margin balance
  const hasBalance = deductMockBalance(asset, amount, "margin");
  if (!hasBalance) {
    return { success: false, error: `Insufficient ${asset} margin balance` };
  }

  const result = await mockTransaction(
    { action: "portfolio-withdraw", asset, amount },
    onStatus,
    onWalletStep
  );

  if (result.success) {
    // Add to wallet balance
    addMockBalance(asset, amount, "wallet");
  } else {
    // Refund on failure
    addMockBalance(asset, amount, "margin");
  }

  return result;
};
