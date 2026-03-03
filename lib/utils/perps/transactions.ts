// Mock perpetuals trading transactions

import { mockTransaction, type TxStatusCallback, type WalletTxStatusCallback } from "@/lib/utils/mock/mockTransaction";
import { deductMockBalance, addMockBalance } from "@/lib/utils/mock/mockBalances";
import type { PerpsPosition, PerpsOrder } from "@/store/perps-trade-store";

const MOCK_PRICES: Record<string, number> = {
  BTCUSDC: 66500,
  ETHUSDC: 3380,
  SOLUSDC: 145,
  BNBUSDC: 580,
};

export interface OpenPerpsParams {
  side: "long" | "short";
  pair: string;          // e.g., "BTCUSDC"
  leverage: number;
  quantity: number;
  quantityUnit: string;
  orderType: string;     // limit, market, etc.
  price?: number;        // null for market
  tp?: number;
  sl?: number;
  marginMode?: "Cross" | "Isolated";
}

export interface PerpsResult {
  success: boolean;
  txHash?: string;
  error?: string;
  position?: PerpsPosition;
  order?: PerpsOrder;
}

export const getPerpsPrice = (pair: string): number => {
  return MOCK_PRICES[pair] ?? 66500;
};

export const openPerpsPositionTx = async (
  params: OpenPerpsParams,
  onStatus?: TxStatusCallback,
  onWalletStep?: WalletTxStatusCallback
): Promise<PerpsResult> => {
  const { side, pair, leverage, quantity, quantityUnit, orderType, price, tp, sl, marginMode } = params;

  const markPrice = getPerpsPrice(pair);
  const entryPrice = price ?? markPrice;

  // Calculate margin required: (quantity * entryPrice) / leverage
  const notionalValue = quantity * entryPrice;
  const marginRequired = notionalValue / leverage;

  // Deduct margin from USDT balance
  const hasBalance = deductMockBalance("USDT", marginRequired, "margin");
  if (!hasBalance) {
    return { success: false, error: `Insufficient margin. Need ${marginRequired.toFixed(2)} USDT` };
  }

  const result = await mockTransaction(
    { action: `perps-${side}`, asset: pair, amount: marginRequired },
    onStatus,
    onWalletStep
  );

  if (!result.success) {
    addMockBalance("USDT", marginRequired, "margin");
    return { success: false, error: result.error };
  }

  // Calculate liquidation price
  const liqPrice = side === "long"
    ? entryPrice * (1 - 1 / leverage)
    : entryPrice * (1 + 1 / leverage);

  if (orderType === "market") {
    const position: PerpsPosition = {
      id: crypto.randomUUID(),
      pair,
      side: side === "long" ? "Long" : "Short",
      leverage,
      entryPrice,
      markPrice,
      quantity,
      quantityUnit,
      margin: marginRequired,
      pnl: 0,
      pnlPercent: 0,
      liqPrice,
      tp,
      sl,
      openedAt: new Date().toISOString(),
      txHash: result.txHash!,
      status: "Open",
      marginMode: marginMode ?? "Cross",
    };
    return { success: true, txHash: result.txHash, position };
  }

  // Non-market orders go to open orders
  const order: PerpsOrder = {
    id: crypto.randomUUID(),
    pair,
    side: side === "long" ? "Long" : "Short",
    type: orderType,
    leverage,
    price: entryPrice,
    quantity,
    quantityUnit,
    margin: marginRequired,
    tp,
    sl,
    createdAt: new Date().toISOString(),
    status: "Open",
    marginMode: marginMode ?? "Cross",
  };

  return { success: true, txHash: result.txHash, order };
};

export const closePerpsPositionTx = async (
  position: PerpsPosition,
  onStatus?: TxStatusCallback,
  onWalletStep?: WalletTxStatusCallback
): Promise<{ success: boolean; closePrice?: number; pnl?: number; error?: string }> => {
  const result = await mockTransaction(
    { action: "perps-close", asset: position.pair, amount: position.margin, delayMs: 1000 },
    onStatus,
    onWalletStep
  );

  if (!result.success) {
    return { success: false, error: result.error };
  }

  const markPrice = getPerpsPrice(position.pair);
  // Add small random slippage
  const closePrice = markPrice + (Math.random() - 0.5) * markPrice * 0.001;

  const priceDiff = position.side === "Long"
    ? closePrice - position.entryPrice
    : position.entryPrice - closePrice;
  const pnl = priceDiff * position.quantity;

  // Return margin + PnL to balance
  addMockBalance("USDT", position.margin + pnl, "margin");

  return { success: true, closePrice, pnl };
};

export const cancelPerpsOrderTx = async (
  orderId: string,
  margin: number,
  onStatus?: TxStatusCallback,
  onWalletStep?: WalletTxStatusCallback
): Promise<{ success: boolean; error?: string }> => {
  const result = await mockTransaction(
    { action: "perps-cancel", asset: "order", amount: 0, delayMs: 800 },
    onStatus,
    onWalletStep
  );

  if (result.success) {
    // Refund margin
    addMockBalance("USDT", margin, "margin");
  }

  return { success: result.success, error: result.error };
};
