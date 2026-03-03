// Mock farm transactions — add/remove liquidity with simulated delays

import { mockTransaction, type TxStatusCallback, type WalletTxStatusCallback } from "@/lib/utils/mock/mockTransaction";
import { deductMockBalance, addMockBalance } from "@/lib/utils/mock/mockBalances";

export interface AddLiquidityParams {
  asset: string;
  amount: number;
  pair?: string;
}

export interface RemoveLiquidityParams {
  asset: string;
  amount: number;
  positionId?: string;
}

export interface FarmTxResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

export const addLiquidityTx = async (
  params: AddLiquidityParams,
  onStatus?: TxStatusCallback,
  onWalletStep?: WalletTxStatusCallback
): Promise<FarmTxResult> => {
  const { asset, amount } = params;

  // Check balance
  const hasBalance = deductMockBalance(asset, amount, "margin");
  if (!hasBalance) {
    return { success: false, error: `Insufficient ${asset} margin balance` };
  }

  const result = await mockTransaction(
    { action: "add-liquidity", asset, amount },
    onStatus,
    onWalletStep
  );

  if (!result.success) {
    // Refund on failure
    addMockBalance(asset, amount, "margin");
  }

  return result;
};

export const removeLiquidityTx = async (
  params: RemoveLiquidityParams,
  onStatus?: TxStatusCallback,
  onWalletStep?: WalletTxStatusCallback
): Promise<FarmTxResult> => {
  const { asset, amount } = params;

  const result = await mockTransaction(
    { action: "remove-liquidity", asset, amount },
    onStatus,
    onWalletStep
  );

  if (result.success) {
    addMockBalance(asset, amount, "margin");
  }

  return result;
};
