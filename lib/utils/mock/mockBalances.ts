// Mock wallet & margin balances for sections without smart contracts.
// Persists in memory during the session (resets on page reload).

type AssetKey = string; // e.g., "ETH", "USDC", "USDT", "BTC", "WETH"

interface BalanceEntry {
  wallet: number;
  margin: number;
}

// Default starting balances (generous for demo purposes)
const DEFAULT_BALANCES: Record<AssetKey, BalanceEntry> = {
  ETH: { wallet: 10.5, margin: 5.0 },
  WETH: { wallet: 10.5, margin: 5.0 },
  BTC: { wallet: 1.2, margin: 0.5 },
  USDC: { wallet: 50000, margin: 25000 },
  USDT: { wallet: 50000, margin: 25000 },
};

// In-memory balance store
let balances: Record<AssetKey, BalanceEntry> = structuredClone(DEFAULT_BALANCES);

export const getMockBalance = (asset: AssetKey, type: "wallet" | "margin" = "wallet"): number => {
  const entry = balances[asset];
  if (!entry) return 0;
  return type === "wallet" ? entry.wallet : entry.margin;
};

export const deductMockBalance = (
  asset: AssetKey,
  amount: number,
  type: "wallet" | "margin" = "margin"
): boolean => {
  if (!balances[asset]) {
    balances[asset] = { wallet: 0, margin: 0 };
  }
  const current = type === "wallet" ? balances[asset].wallet : balances[asset].margin;
  if (current < amount) return false; // insufficient
  if (type === "wallet") {
    balances[asset].wallet -= amount;
  } else {
    balances[asset].margin -= amount;
  }
  return true;
};

export const addMockBalance = (
  asset: AssetKey,
  amount: number,
  type: "wallet" | "margin" = "margin"
): void => {
  if (!balances[asset]) {
    balances[asset] = { wallet: 0, margin: 0 };
  }
  if (type === "wallet") {
    balances[asset].wallet += amount;
  } else {
    balances[asset].margin += amount;
  }
};

export const getAllMockBalances = (): Record<AssetKey, BalanceEntry> => {
  return structuredClone(balances);
};

export const resetMockBalances = (): void => {
  balances = structuredClone(DEFAULT_BALANCES);
};
