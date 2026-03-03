// Mock spot trading transactions

import { mockTransaction, type TxStatusCallback, type WalletTxStatusCallback } from "@/lib/utils/mock/mockTransaction";
import { deductMockBalance, addMockBalance } from "@/lib/utils/mock/mockBalances";
import type { ActivePositionType, OpenOrderType, OrderHistoryType, TradeHistoryType } from "@/lib/types";

export interface PlaceSpotOrderParams {
  orderType: "limit" | "market" | "trigger";
  side: "buy" | "sell";
  pair: string;
  price: number | null;       // null for market orders
  quantity: number;
  amount: number;
  takeProfit?: { label: string; value: number }[];
  stopLoss?: { triggerPrice: number; limitPrice: number; trail: number };
  loop?: string;
}

export interface SpotTxResult {
  success: boolean;
  txHash?: string;
  error?: string;
  position?: ActivePositionType;
  openOrder?: OpenOrderType;
}

const MOCK_MARKET_PRICE = 66500; // BTC/USDT mock price

export const placeSpotOrderTx = async (
  params: PlaceSpotOrderParams,
  onStatus?: TxStatusCallback,
  onWalletStep?: WalletTxStatusCallback
): Promise<SpotTxResult> => {
  const { orderType, side, pair, price, quantity, amount } = params;

  // Deduct balance for buy orders
  if (side === "buy") {
    const hasBalance = deductMockBalance("USDT", amount, "margin");
    if (!hasBalance) {
      return { success: false, error: "Insufficient USDT margin balance" };
    }
  } else {
    // For sell, deduct the asset
    const baseAsset = pair.split("/")[0] || "BTC";
    const hasBalance = deductMockBalance(baseAsset, quantity, "margin");
    if (!hasBalance) {
      return { success: false, error: `Insufficient ${baseAsset} margin balance` };
    }
  }

  const result = await mockTransaction(
    { action: `spot-${side}`, asset: pair, amount },
    onStatus,
    onWalletStep
  );

  if (!result.success) {
    // Refund on failure
    if (side === "buy") {
      addMockBalance("USDT", amount, "margin");
    } else {
      const baseAsset = pair.split("/")[0] || "BTC";
      addMockBalance(baseAsset, quantity, "margin");
    }
    return { success: false, error: result.error };
  }

  const fillPrice = price ?? MOCK_MARKET_PRICE;

  if (orderType === "market") {
    const position: ActivePositionType = {
      id: crypto.randomUUID(),
      dateTime: new Date().toISOString().replace("T", " ").slice(0, 19),
      pair,
      type: "Market",
      side: side === "buy" ? "Buy" : "Sell",
      qty: `${quantity} ${pair.split("/")[0]}`,
      estFilledPrice: `${fillPrice} USDT`,
      takeProfit: params.takeProfit,
      slTriggerPrice: params.stopLoss?.triggerPrice,
      slLimit: params.stopLoss?.limitPrice,
      loop: params.loop,
      currentPnlUsd: "+0.00",
      currentPnlPct: "0.00%",
      status: "Active",
    };
    return { success: true, txHash: result.txHash, position };
  }

  // Limit / Trigger orders go to open orders
  const openOrder: OpenOrderType = {
    id: crypto.randomUUID(),
    dateTime: new Date().toISOString().replace("T", " ").slice(0, 19),
    pair,
    type: orderType === "limit" ? "Limit" : "Trigger",
    side: side === "buy" ? "Buy" : "Sell",
    qty: `${quantity}`,
    price: fillPrice,
    takeProfit: params.takeProfit ?? [],
    slTriggerPrice: params.stopLoss?.triggerPrice ?? 0,
    slLimit: params.stopLoss?.limitPrice ?? 0,
    trail: params.stopLoss?.trail ?? 0,
    loop: params.loop ?? "-",
    triggerCondition: orderType === "trigger" ? `LIMIT @ ${fillPrice}` : "-",
    total: `$${amount.toFixed(2)}`,
  };

  return { success: true, txHash: result.txHash, openOrder };
};

export const cancelSpotOrderTx = async (
  orderId: string,
  onStatus?: TxStatusCallback,
  onWalletStep?: WalletTxStatusCallback
): Promise<{ success: boolean; error?: string }> => {
  const result = await mockTransaction(
    { action: "spot-cancel", asset: "order", amount: 0, delayMs: 800 },
    onStatus,
    onWalletStep
  );
  return { success: result.success, error: result.error };
};

export const closeSpotPositionTx = async (
  position: ActivePositionType,
  onStatus?: TxStatusCallback,
  onWalletStep?: WalletTxStatusCallback
): Promise<{ success: boolean; orderHistory?: OrderHistoryType; tradeHistory?: TradeHistoryType; error?: string }> => {
  const result = await mockTransaction(
    { action: "spot-close", asset: position.pair, amount: 0, delayMs: 1000 },
    onStatus,
    onWalletStep
  );

  if (!result.success) {
    return { success: false, error: result.error };
  }

  // Create history entries
  const qtyNum = parseFloat(position.qty) || 0;
  const priceNum = parseFloat(position.estFilledPrice) || MOCK_MARKET_PRICE;
  const closePrice = MOCK_MARKET_PRICE + (Math.random() - 0.5) * 200;
  const pnl = position.side === "Buy"
    ? (closePrice - priceNum) * qtyNum
    : (priceNum - closePrice) * qtyNum;

  const orderHistory: OrderHistoryType = {
    id: crypto.randomUUID(),
    dateTime: new Date().toISOString().replace("T", " ").slice(0, 19),
    pair: position.pair,
    type: position.type === "Market" ? "Market" : "Limit",
    side: position.side,
    orderQty: position.qty,
    executedQty: position.qty,
    price: priceNum,
    avgFillPrice: closePrice,
    averageTPPrice: "-",
    gainUsd: pnl.toFixed(2),
    gainPct: ((pnl / (priceNum * qtyNum)) * 100).toFixed(2) + "%",
    total: `$${(closePrice * qtyNum).toFixed(2)}`,
    status: "Filled",
  };

  const tradeHistory: TradeHistoryType = {
    id: crypto.randomUUID(),
    dateTime: new Date().toISOString().replace("T", " ").slice(0, 19),
    pair: position.pair,
    side: position.side,
    executedQty: position.qty,
    avgFilledPrice: `${closePrice.toFixed(2)} USDT`,
    fee: `${(closePrice * qtyNum * 0.001).toFixed(4)} USDT`,
    role: "Taker",
    total: "Filled",
  };

  // Add back the received asset
  if (position.side === "Buy") {
    addMockBalance("USDT", closePrice * qtyNum, "margin");
  } else {
    const baseAsset = position.pair.split("/")[0] || "BTC";
    addMockBalance(baseAsset, qtyNum, "margin");
  }

  return { success: true, orderHistory, tradeHistory };
};
