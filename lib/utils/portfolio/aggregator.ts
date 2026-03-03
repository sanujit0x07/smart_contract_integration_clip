// Portfolio aggregator — reads from all section stores to compute totals

import { useMarginStore } from "@/store/margin-account-state";
import { useEarnStore, selectTotalPositionValue } from "@/store/earn-state";
import { useFarmStore } from "@/store/farm-store";
import { useSpotTradeStore } from "@/store/spot-trade-store";
import { usePerpsTradeStore } from "@/store/perps-trade-store";
import { getAllMockBalances } from "@/lib/utils/mock/mockBalances";

export interface PortfolioSummary {
  totalAssets: number;
  netPnl: number;
  totalVolume: number;
  breakdown: {
    section: string;
    value: number;
    pnl: number;
  }[];
}

export interface PortfolioTxEntry {
  id: string;
  section: string;
  action: string;
  asset: string;
  amount: number;
  timestamp: string;
  txHash?: string;
}

export const getPortfolioSummary = (): PortfolioSummary => {
  const breakdown: { section: string; value: number; pnl: number }[] = [];
  let totalAssets = 0;
  let netPnl = 0;
  let totalVolume = 0;

  // 1. Margin section
  const marginState = useMarginStore.getState().marginState;
  if (marginState) {
    const marginNet = marginState.collateralUsd - marginState.borrowUsd;
    breakdown.push({ section: "Margin", value: marginState.collateralUsd, pnl: 0 });
    totalAssets += marginNet;
  }

  // 2. Earn section
  const earnState = useEarnStore.getState();
  const earnTotal = selectTotalPositionValue(earnState as any);
  if (earnTotal > 0) {
    breakdown.push({ section: "Earn", value: earnTotal, pnl: 0 });
    totalAssets += earnTotal;
  }

  // 3. Farm section
  const farmState = useFarmStore.getState();
  const farmTVL = farmState.totalTVL ?? 0;
  if (farmTVL > 0) {
    breakdown.push({ section: "Farm", value: farmTVL, pnl: 0 });
    totalAssets += farmTVL;
  }

  // 4. Spot section
  const spotState = useSpotTradeStore.getState();
  const spotPositions = spotState.activePositions ?? [];
  let spotValue = 0;
  let spotPnl = 0;
  spotPositions.forEach((pos: any) => {
    const priceStr = pos.estFilledPrice?.replace(/[^0-9.]/g, "") ?? "0";
    const qtyStr = pos.qty?.replace(/[^0-9.]/g, "") ?? "0";
    const val = parseFloat(priceStr) * parseFloat(qtyStr);
    spotValue += val;
    const pnlNum = parseFloat(pos.currentPnlUsd?.replace(/[^0-9.-]/g, "") ?? "0");
    spotPnl += pnlNum;
  });
  if (spotValue > 0 || spotPositions.length > 0) {
    breakdown.push({ section: "Spot", value: spotValue, pnl: spotPnl });
    totalAssets += spotValue;
    netPnl += spotPnl;
  }
  totalVolume += spotValue;

  // 5. Perps section
  const perpsState = usePerpsTradeStore.getState();
  const perpsPositions = perpsState.positions ?? [];
  let perpsMargin = 0;
  let perpsPnl = 0;
  perpsPositions.forEach((pos) => {
    perpsMargin += pos.margin;
    perpsPnl += pos.pnl;
  });
  if (perpsMargin > 0 || perpsPositions.length > 0) {
    breakdown.push({ section: "Perps", value: perpsMargin, pnl: perpsPnl });
    totalAssets += perpsMargin;
    netPnl += perpsPnl;
  }
  totalVolume += perpsPositions.reduce((sum, p) => sum + p.quantity * p.entryPrice, 0);

  // 6. Add wallet balances
  const balances = getAllMockBalances();
  let walletTotal = 0;
  const ethPrice = 3380; // mock
  Object.entries(balances).forEach(([asset, entry]) => {
    if (asset === "ETH" || asset === "WETH") {
      walletTotal += (entry.wallet + entry.margin) * ethPrice;
    } else if (asset === "BTC") {
      walletTotal += (entry.wallet + entry.margin) * 66500;
    } else {
      walletTotal += entry.wallet + entry.margin;
    }
  });
  totalAssets += walletTotal;
  breakdown.push({ section: "Wallet", value: walletTotal, pnl: 0 });

  // Perps history P&L
  const perpsHistory = perpsState.positionHistory ?? [];
  perpsHistory.forEach((h) => {
    netPnl += h.realizedPnl;
    totalVolume += h.quantity * h.entryPrice;
  });

  return { totalAssets, netPnl, totalVolume, breakdown };
};
