import createNewStore from "@/zustand/index";


// has margin account? + config/info

// Types
export interface MarginAccountInfoStateType {
  totalBorrowedValue: number;
  totalCollateralValue: number;
  totalValue: number;
  avgHealthFactor: number;
  timeToLiquidation: number;
  borrowRate: number;
  liquidationPremium: number;
  liquidationFee: number;
  debtLimit: number;
  minDebt: number;
  maxDebt: number;
  hasMarginAccount: boolean;
}

// Initial State (using realistic demo values)
const initialState: MarginAccountInfoStateType = {
  totalBorrowedValue: 90,
  totalCollateralValue: 1000,
  totalValue: 910,
  avgHealthFactor: 3.42,
  timeToLiquidation: 4320,
  borrowRate: 5.25,
  liquidationPremium: 4.5,
  liquidationFee: 1.0,
  debtLimit: 5000,
  minDebt: 10,
  maxDebt: 3500,
  hasMarginAccount: true,
};

// Export Store
export const useMarginAccountInfoStore = createNewStore(initialState, {
  name: "margin-account-info-store",
  devTools: true,
  persist: true,
});

