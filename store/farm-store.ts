import createNewStore from "@/zustand/index";

// Types
export interface FarmRowData {
  cell: {
    chain?: string;
    icon?: string;
    title?: string;
    titles?: string[];
    description?: string;
    tag?: string | number;
    tags?: (string | number)[];
    clickable?: string;
    onlyIcons?: string[];
    percentage?: number;
    value?: string;
  }[];
}

export interface FarmPosition {
  id: string;
  pair: string;
  asset: string;
  lpTokens: number;
  valueUsd: number;
  apr: number;
  depositedAt: string;
  txHash: string;
}

export interface FarmState {
  selectedRow: FarmRowData | null;
  tabType: "single" | "multi" | null;
  positions: FarmPosition[];
  totalTVL: number;
  isSubmitting: boolean;
  txStatus: string | null;
  lastError: string | null;
}

// Initial State
const initialState: FarmState = {
  selectedRow: null,
  tabType: null,
  positions: [],
  totalTVL: 0,
  isSubmitting: false,
  txStatus: null,
  lastError: null,
};

// Export Store
export const useFarmStore = createNewStore(initialState, {
  name: "farm-store",
  devTools: true,
  persist: false,
});
