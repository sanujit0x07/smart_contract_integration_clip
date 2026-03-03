import { ActivePositionType, OpenOrderType, OrderHistoryType, TradeHistoryType } from "@/lib/types";
import createNewStore from "@/zustand";

export interface SpotTradeStateType {
  activePositions: ActivePositionType[];
  openOrders: OpenOrderType[];
  orderHistory: OrderHistoryType[];
  tradeHistory: TradeHistoryType[];
  isSubmitting: boolean;
  txStatus: string | null;
  lastError: string | null;
}

const initialState: SpotTradeStateType = {
  activePositions: [],
  openOrders: [],
  orderHistory: [],
  tradeHistory: [],
  isSubmitting: false,
  txStatus: null,
  lastError: null,
};

export const useSpotTradeStore = createNewStore(initialState, {
  name: "spot-trade-store",
  devTools: true,
  persist: true,
});
