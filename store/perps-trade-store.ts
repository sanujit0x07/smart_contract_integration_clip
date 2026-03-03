import { create } from "zustand";

// Perps-specific position types
export interface PerpsPosition {
  id: string;
  pair: string;
  side: "Long" | "Short";
  leverage: number;
  entryPrice: number;
  markPrice: number;
  quantity: number;
  quantityUnit: string;
  margin: number;           // USDT margin used
  pnl: number;              // unrealized P&L
  pnlPercent: number;
  liqPrice: number;
  tp?: number;
  sl?: number;
  openedAt: string;
  txHash: string;
  status: "Open" | "Closed";
  marginMode?: "Cross" | "Isolated";
}

export interface PerpsOrder {
  id: string;
  pair: string;
  side: "Long" | "Short";
  type: string;             // limit, trigger, trailing-entry, etc.
  leverage: number;
  price: number;
  quantity: number;
  quantityUnit: string;
  margin: number;
  tp?: number;
  sl?: number;
  createdAt: string;
  status: "Open" | "Filled" | "Cancelled";
  marginMode?: "Cross" | "Isolated";
}

export interface PerpsOrderHistory {
  id: string;
  pair: string;
  side: "Long" | "Short";
  marginCoin: string;
  orderType: string;
  timeInForce: string;
  orderQty: string;
  filledQty: string;
  price: string;
  avgFilledPrice: string;
  fee: string;
  reduceOnly: "Yes" | "No";
  status: "Executed" | "Canceled" | "Partially filled";
  createdAt: string;
  marginMode: "Cross" | "Isolated";
}

export interface PerpsTransactionHistory {
  id: string;
  coin: string;
  marginMode: "Cross" | "Isolated";
  futures: string;
  type: string;
  amount: string;
  fee: string;
  walletBalance: string;
  createdAt: string;
}

export interface PerpsPositionHistory {
  id: string;
  pair: string;
  side: "Long" | "Short";
  leverage: number;
  entryPrice: number;
  closePrice: number;
  quantity: number;
  quantityUnit: string;
  margin: number;
  realizedPnl: number;
  realizedPnlPercent: number;
  openedAt: string;
  closedAt: string;
}

export interface PerpsTradeStore {
  positions: PerpsPosition[];
  openOrders: PerpsOrder[];
  positionHistory: PerpsPositionHistory[];
  orderHistory: PerpsOrderHistory[];
  transactionHistory: PerpsTransactionHistory[];
  isSubmitting: boolean;
  txStatus: string | null;
  lastError: string | null;

  // Actions
  addPosition: (position: PerpsPosition) => void;
  closePosition: (positionId: string, closePrice: number) => void;
  addOrder: (order: PerpsOrder) => void;
  cancelOrder: (orderId: string) => void;
  fillOrder: (orderId: string) => void;
  updateMarkPrices: (priceMap: Record<string, number>) => void;
  setSubmitting: (isSubmitting: boolean, txStatus?: string | null) => void;
  setError: (error: string | null) => void;
}

const getBaseAsset = (pair: string) => pair.replace("USDC", "").replace("USDT", "");

export const usePerpsTradeStore = create<PerpsTradeStore>((set, get) => ({
  positions: [],
  openOrders: [],
  positionHistory: [],
  orderHistory: [],
  transactionHistory: [],
  isSubmitting: false,
  txStatus: null,
  lastError: null,

  addPosition: (position) => {
    const baseAsset = getBaseAsset(position.pair);
    const fee = position.margin * 0.0006;

    // Order history for the open
    const oh: PerpsOrderHistory = {
      id: crypto.randomUUID(),
      pair: position.pair,
      side: position.side,
      marginCoin: "SUSDT",
      orderType: "Market",
      timeInForce: "GTC",
      orderQty: `${position.quantity.toFixed(4)} ${baseAsset}`,
      filledQty: `${position.quantity.toFixed(4)} ${baseAsset}`,
      price: position.entryPrice.toLocaleString(),
      avgFilledPrice: position.entryPrice.toLocaleString(),
      fee: `${fee.toFixed(4)} USDT`,
      reduceOnly: "No",
      status: "Executed",
      createdAt: position.openedAt,
      marginMode: position.marginMode ?? "Cross",
    };

    // Transaction: trading fee
    const txFee: PerpsTransactionHistory = {
      id: crypto.randomUUID(),
      coin: "SUSDT",
      marginMode: position.marginMode ?? "Cross",
      futures: position.pair,
      type: "Trading Fee",
      amount: `-${fee.toFixed(4)} SUSDT`,
      fee: `${fee.toFixed(4)} SUSDT`,
      walletBalance: `-- SUSDT`,
      createdAt: position.openedAt,
    };

    set((state) => ({
      positions: [position, ...state.positions],
      orderHistory: [oh, ...state.orderHistory],
      transactionHistory: [txFee, ...state.transactionHistory],
    }));
  },

  closePosition: (positionId, closePrice) => {
    const state = get();
    const pos = state.positions.find((p) => p.id === positionId);
    if (!pos) return;

    const priceDiff = pos.side === "Long"
      ? closePrice - pos.entryPrice
      : pos.entryPrice - closePrice;
    const realizedPnl = priceDiff * pos.quantity;
    const realizedPnlPercent = (realizedPnl / pos.margin) * 100;
    const closedAt = new Date().toISOString();
    const baseAsset = getBaseAsset(pos.pair);
    const fee = pos.margin * 0.0006;

    const historyEntry: PerpsPositionHistory = {
      id: crypto.randomUUID(),
      pair: pos.pair,
      side: pos.side,
      leverage: pos.leverage,
      entryPrice: pos.entryPrice,
      closePrice,
      quantity: pos.quantity,
      quantityUnit: pos.quantityUnit,
      margin: pos.margin,
      realizedPnl,
      realizedPnlPercent,
      openedAt: pos.openedAt,
      closedAt,
    };

    // Close order history
    const oh: PerpsOrderHistory = {
      id: crypto.randomUUID(),
      pair: pos.pair,
      side: pos.side,
      marginCoin: "SUSDT",
      orderType: "Market",
      timeInForce: "GTC",
      orderQty: `${pos.quantity.toFixed(4)} ${baseAsset}`,
      filledQty: `${pos.quantity.toFixed(4)} ${baseAsset}`,
      price: "Market",
      avgFilledPrice: closePrice.toLocaleString(),
      fee: `${fee.toFixed(4)} USDT`,
      reduceOnly: "Yes",
      status: "Executed",
      createdAt: closedAt,
      marginMode: pos.marginMode ?? "Cross",
    };

    // Transaction entries
    const txPnl: PerpsTransactionHistory = {
      id: crypto.randomUUID(),
      coin: "SUSDT",
      marginMode: pos.marginMode ?? "Cross",
      futures: pos.pair,
      type: "Realized PnL",
      amount: `${realizedPnl >= 0 ? "+" : ""}${realizedPnl.toFixed(4)} SUSDT`,
      fee: "0.00 SUSDT",
      walletBalance: `-- SUSDT`,
      createdAt: closedAt,
    };

    const txFee: PerpsTransactionHistory = {
      id: crypto.randomUUID(),
      coin: "SUSDT",
      marginMode: pos.marginMode ?? "Cross",
      futures: pos.pair,
      type: "Trading Fee",
      amount: `-${fee.toFixed(4)} SUSDT`,
      fee: `${fee.toFixed(4)} SUSDT`,
      walletBalance: `-- SUSDT`,
      createdAt: closedAt,
    };

    set((state) => ({
      positions: state.positions.filter((p) => p.id !== positionId),
      positionHistory: [historyEntry, ...state.positionHistory],
      orderHistory: [oh, ...state.orderHistory],
      transactionHistory: [txPnl, txFee, ...state.transactionHistory],
    }));
  },

  addOrder: (order) => {
    set((state) => ({
      openOrders: [order, ...state.openOrders],
    }));
  },

  cancelOrder: (orderId) => {
    const state = get();
    const order = state.openOrders.find((o) => o.id === orderId);
    const cancelledHistory: PerpsOrderHistory[] = [];

    if (order) {
      const baseAsset = getBaseAsset(order.pair);
      cancelledHistory.push({
        id: crypto.randomUUID(),
        pair: order.pair,
        side: order.side,
        marginCoin: "SUSDT",
        orderType: order.type === "limit" ? "Limit" : order.type,
        timeInForce: "GTC",
        orderQty: `${order.quantity.toFixed(4)} ${baseAsset}`,
        filledQty: `0.0000 ${baseAsset}`,
        price: order.price.toLocaleString(),
        avgFilledPrice: "--",
        fee: "0.0000 USDT",
        reduceOnly: "No",
        status: "Canceled",
        createdAt: new Date().toISOString(),
        marginMode: order.marginMode ?? "Cross",
      });
    }

    set((state) => ({
      openOrders: state.openOrders.filter((o) => o.id !== orderId),
      orderHistory: [...cancelledHistory, ...state.orderHistory],
    }));
  },

  fillOrder: (orderId) => {
    const state = get();
    const order = state.openOrders.find((o) => o.id === orderId);
    if (!order) return;

    const liqPrice = order.side === "Long"
      ? order.price * (1 - 1 / order.leverage)
      : order.price * (1 + 1 / order.leverage);

    const position: PerpsPosition = {
      id: crypto.randomUUID(),
      pair: order.pair,
      side: order.side,
      leverage: order.leverage,
      entryPrice: order.price,
      markPrice: order.price,
      quantity: order.quantity,
      quantityUnit: order.quantityUnit,
      margin: order.margin,
      pnl: 0,
      pnlPercent: 0,
      liqPrice,
      tp: order.tp,
      sl: order.sl,
      openedAt: new Date().toISOString(),
      txHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
      status: "Open",
      marginMode: order.marginMode ?? "Cross",
    };

    const baseAsset = getBaseAsset(order.pair);
    const fee = order.margin * 0.0006;
    const oh: PerpsOrderHistory = {
      id: crypto.randomUUID(),
      pair: order.pair,
      side: order.side,
      marginCoin: "SUSDT",
      orderType: order.type === "limit" ? "Limit" : order.type,
      timeInForce: "GTC",
      orderQty: `${order.quantity.toFixed(4)} ${baseAsset}`,
      filledQty: `${order.quantity.toFixed(4)} ${baseAsset}`,
      price: order.price.toLocaleString(),
      avgFilledPrice: order.price.toLocaleString(),
      fee: `${fee.toFixed(4)} USDT`,
      reduceOnly: "No",
      status: "Executed",
      createdAt: new Date().toISOString(),
      marginMode: order.marginMode ?? "Cross",
    };

    set((state) => ({
      openOrders: state.openOrders.filter((o) => o.id !== orderId),
      positions: [position, ...state.positions],
      orderHistory: [oh, ...state.orderHistory],
    }));
  },

  updateMarkPrices: (priceMap) => {
    set((state) => ({
      positions: state.positions.map((pos) => {
        const newMark = priceMap[pos.pair] ?? pos.markPrice;
        const priceDiff = pos.side === "Long"
          ? newMark - pos.entryPrice
          : pos.entryPrice - newMark;
        const pnl = priceDiff * pos.quantity;
        const pnlPercent = (pnl / pos.margin) * 100;
        return { ...pos, markPrice: newMark, pnl, pnlPercent };
      }),
    }));
  },

  setSubmitting: (isSubmitting, txStatus = null) => {
    set({ isSubmitting, txStatus });
  },

  setError: (error) => {
    set({ lastError: error });
  },
}));
